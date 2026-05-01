package com.devxmanish.taskmanager.service;

import com.devxmanish.taskmanager.dto.request.*;
import com.devxmanish.taskmanager.dto.response.AuthResponse;
import com.devxmanish.taskmanager.entity.Invitation;
import com.devxmanish.taskmanager.entity.Organization;
import com.devxmanish.taskmanager.entity.User;
import com.devxmanish.taskmanager.entity.enums.InviteStatus;
import com.devxmanish.taskmanager.entity.enums.Role;
import com.devxmanish.taskmanager.repository.InvitationRepository;
import com.devxmanish.taskmanager.repository.OrganizationRepository;
import com.devxmanish.taskmanager.repository.UserRepository;
import com.devxmanish.taskmanager.security.JwtTokenProvider;
import com.devxmanish.taskmanager.security.TotpService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final InvitationRepository invitationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TotpService totpService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       OrganizationRepository organizationRepository,
                       InvitationRepository invitationRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       TotpService totpService,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.invitationRepository = invitationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.totpService = totpService;
        this.emailService = emailService;
    }

    public String initiateSignup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        String[] otpAndToken = totpService.generateOtpAndToken(request.getEmail());
        emailService.sendOtpEmail(request.getEmail(), otpAndToken[0]);
        return otpAndToken[1];
    }

    @Transactional
    public AuthResponse verifyOtpAndRegister(VerifyOtpRequest request) {
        if (!totpService.verifyOtp(request.getVerificationToken(), request.getOtp())) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        String email = totpService.extractEmailFromToken(request.getVerificationToken());
        if (email == null || userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Registration failed — email invalid or already taken");
        }

        Organization org;
        Role assignedRole;

        if (StringUtils.hasText(request.getInviteToken())) {
            // Invited user → join existing org as MEMBER
            Long orgId = totpService.extractOrgIdFromInviteToken(request.getInviteToken());
            if (orgId == null) {
                throw new IllegalArgumentException("Invalid or expired invite token");
            }
            org = organizationRepository.findById(orgId)
                    .orElseThrow(() -> new IllegalArgumentException("Organization not found"));
            assignedRole = Role.MEMBER;

            // Mark invitation as ACCEPTED
            invitationRepository.findByEmailAndOrganizationIdAndStatus(email, orgId, InviteStatus.PENDING)
                    .ifPresent(inv -> {
                        inv.setStatus(InviteStatus.ACCEPTED);
                        inv.setAcceptedAt(LocalDateTime.now());
                        invitationRepository.save(inv);
                    });
        } else if (StringUtils.hasText(request.getOrganizationName())) {
            String slug = generateSlug(request.getOrganizationName());
            org = Organization.builder()
                    .name(request.getOrganizationName())
                    .slug(slug)
                    .build();
            org = organizationRepository.save(org);
            assignedRole = Role.ADMIN;
        } else {
            throw new IllegalArgumentException("Organization name is required for signup");
        }

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .emailVerified(true)
                .organization(org)
                .build();
        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(
                user.getId(), user.getEmail(), user.getRole().name(), org.getId());

        emailService.sendWelcomeEmail(user.getEmail(), user.getName(), org.getName());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getId())
                .organizationId(org.getId())
                .organizationName(org.getName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        if (!user.getEmailVerified()) {
            throw new IllegalArgumentException("Email not verified. Please complete signup first.");
        }

        Long orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
        String orgName = user.getOrganization() != null ? user.getOrganization().getName() : null;

        String token = jwtTokenProvider.generateToken(
                user.getId(), user.getEmail(), user.getRole().name(), orgId);

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getId())
                .organizationId(orgId)
                .organizationName(orgName)
                .build();
    }

    /**
     * Invite user with configurable expiry (default 48h)
     */
    @Transactional
    public void inviteUser(String inviteeEmail, User adminUser, int expiryHours) {
        if (adminUser.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Only admins can invite users");
        }
        if (userRepository.existsByEmail(inviteeEmail)) {
            throw new IllegalArgumentException("User with this email is already registered");
        }

        Organization org = adminUser.getOrganization();
        if (org == null) {
            throw new IllegalArgumentException("Admin must belong to an organization");
        }

        // Check if there's already a pending invite
        if (invitationRepository.existsByEmailAndOrganizationIdAndStatus(
                inviteeEmail, org.getId(), InviteStatus.PENDING)) {
            throw new IllegalArgumentException("A pending invitation already exists for " + inviteeEmail);
        }

        if (expiryHours <= 0) expiryHours = 48;

        String inviteToken = totpService.generateInviteToken(org.getId(), inviteeEmail, expiryHours);

        Invitation invitation = Invitation.builder()
                .email(inviteeEmail)
                .organization(org)
                .invitedBy(adminUser)
                .token(inviteToken)
                .expiresAt(LocalDateTime.now().plusHours(expiryHours))
                .status(InviteStatus.PENDING)
                .build();
        invitationRepository.save(invitation);

        emailService.sendInviteEmail(inviteeEmail, org.getName(), adminUser.getName(), inviteToken);
    }

    /** Overload for backward compatibility */
    public void inviteUser(String inviteeEmail, User adminUser) {
        inviteUser(inviteeEmail, adminUser, 48);
    }

    /**
     * Resend an existing invitation with a new token and expiry
     */
    @Transactional
    public void resendInvite(Invitation invitation, User adminUser, int expiryHours) {
        if (expiryHours <= 0) expiryHours = 48;

        Organization org = invitation.getOrganization();
        String newToken = totpService.generateInviteToken(org.getId(), invitation.getEmail(), expiryHours);

        invitation.setToken(newToken);
        invitation.setExpiresAt(LocalDateTime.now().plusHours(expiryHours));
        invitation.setStatus(InviteStatus.PENDING);
        invitationRepository.save(invitation);

        emailService.sendInviteEmail(invitation.getEmail(), org.getName(), adminUser.getName(), newToken);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email"));
        String resetToken = totpService.generateResetToken(user.getId(), user.getPassword());
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
    }

    public void resetPassword(ResetPasswordRequest request) {
        Long userId = totpService.extractUserIdFromResetToken(request.getToken());
        if (userId == null) throw new IllegalArgumentException("Invalid reset token");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!totpService.verifyResetToken(request.getToken(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid or expired reset token");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private String generateSlug(String orgName) {
        String slug = orgName.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        String baseSlug = slug;
        int counter = 1;
        while (organizationRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }
}
