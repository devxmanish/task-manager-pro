package com.devxmanish.taskmanager.controller;

import com.devxmanish.taskmanager.dto.response.ApiResponse;
import com.devxmanish.taskmanager.entity.Invitation;
import com.devxmanish.taskmanager.entity.User;
import com.devxmanish.taskmanager.entity.enums.InviteStatus;
import com.devxmanish.taskmanager.exception.ResourceNotFoundException;
import com.devxmanish.taskmanager.exception.UnauthorizedException;
import com.devxmanish.taskmanager.repository.InvitationRepository;
import com.devxmanish.taskmanager.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/invitations")
public class InvitationController {

    private final InvitationRepository invitationRepo;
    private final AuthService authService;

    public InvitationController(InvitationRepository invitationRepo, AuthService authService) {
        this.invitationRepo = invitationRepo;
        this.authService = authService;
    }

    /**
     * List all invitations for the current user's organization
     */
    @GetMapping
    public ResponseEntity<ApiResponse> listInvitations(@AuthenticationPrincipal User user) {
        if (user.getOrganization() == null) {
            throw new UnauthorizedException("You must belong to an organization");
        }

        // Auto-expire stale invitations
        expireStaleInvitations();

        List<Map<String, Object>> invitations = invitationRepo
                .findByOrganizationIdOrderByCreatedAtDesc(user.getOrganization().getId())
                .stream().map(this::toInviteMap).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Invitations fetched", invitations));
    }

    /**
     * Revoke a pending invitation
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> revokeInvitation(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Invitation inv = invitationRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!inv.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new UnauthorizedException("Invitation does not belong to your organization");
        }
        if (inv.getStatus() != InviteStatus.PENDING) {
            throw new IllegalArgumentException("Only pending invitations can be revoked");
        }

        inv.setStatus(InviteStatus.REVOKED);
        invitationRepo.save(inv);

        return ResponseEntity.ok(ApiResponse.success("Invitation revoked"));
    }

    /**
     * Resend a pending/expired invitation
     */
    @PostMapping("/{id}/resend")
    public ResponseEntity<ApiResponse> resendInvitation(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body,
            @AuthenticationPrincipal User user) {
        Invitation inv = invitationRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!inv.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new UnauthorizedException("Invitation does not belong to your organization");
        }
        if (inv.getStatus() == InviteStatus.ACCEPTED) {
            throw new IllegalArgumentException("This invitation has already been accepted");
        }

        int expiryHours = 48;
        if (body != null && body.get("expiryHours") != null) {
            expiryHours = ((Number) body.get("expiryHours")).intValue();
        }

        authService.resendInvite(inv, user, expiryHours);

        return ResponseEntity.ok(ApiResponse.success("Invitation resent to " + inv.getEmail()));
    }

    // ── helpers ──

    private void expireStaleInvitations() {
        List<Invitation> stale = invitationRepo.findByStatusAndExpiresAtBefore(
                InviteStatus.PENDING, LocalDateTime.now());
        for (Invitation inv : stale) {
            inv.setStatus(InviteStatus.EXPIRED);
        }
        if (!stale.isEmpty()) invitationRepo.saveAll(stale);
    }

    private Map<String, Object> toInviteMap(Invitation inv) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", inv.getId());
        m.put("email", inv.getEmail());
        m.put("status", inv.getStatus().name());
        m.put("invitedByName", inv.getInvitedBy().getName());
        m.put("invitedById", inv.getInvitedBy().getId());
        m.put("expiresAt", inv.getExpiresAt());
        m.put("acceptedAt", inv.getAcceptedAt());
        m.put("createdAt", inv.getCreatedAt());
        return m;
    }
}
