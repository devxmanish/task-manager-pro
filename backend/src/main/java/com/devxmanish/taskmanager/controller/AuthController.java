package com.devxmanish.taskmanager.controller;

import com.devxmanish.taskmanager.dto.request.*;
import com.devxmanish.taskmanager.dto.response.ApiResponse;
import com.devxmanish.taskmanager.dto.response.AuthResponse;
import com.devxmanish.taskmanager.entity.User;
import com.devxmanish.taskmanager.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse> signup(@Valid @RequestBody SignupRequest request) {
        String verificationToken = authService.initiateSignup(request);

        Map<String, String> data = new LinkedHashMap<>();
        data.put("verificationToken", verificationToken);

        return ResponseEntity.ok(ApiResponse.success("OTP sent to your email", data));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse authResponse = authService.verifyOtpAndRegister(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", authResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getCurrentUser(@AuthenticationPrincipal User user) {
        Map<String, Object> userData = new LinkedHashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole().name());
        userData.put("emailVerified", user.getEmailVerified());
        userData.put("createdAt", user.getCreatedAt());
        if (user.getOrganization() != null) {
            userData.put("organizationId", user.getOrganization().getId());
            userData.put("organizationName", user.getOrganization().getName());
        }

        return ResponseEntity.ok(ApiResponse.success("User fetched", userData));
    }

    @PostMapping("/invite")
    public ResponseEntity<ApiResponse> inviteUsers(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {

        // Support both single email and batch emails
        java.util.List<String> emails = new java.util.ArrayList<>();

        Object emailsObj = body.get("emails");
        if (emailsObj instanceof java.util.List<?> list) {
            for (Object item : list) {
                if (item instanceof String s && !s.isBlank()) emails.add(s.trim());
            }
        }
        Object singleEmail = body.get("email");
        if (singleEmail instanceof String s && !s.isBlank()) {
            emails.add(s.trim());
        }

        if (emails.isEmpty()) {
            throw new IllegalArgumentException("At least one email is required");
        }

        // Configurable expiry (default 48 hours)
        int expiryHours = 48;
        if (body.get("expiryHours") != null) {
            expiryHours = ((Number) body.get("expiryHours")).intValue();
        }

        java.util.List<Map<String, String>> results = new java.util.ArrayList<>();
        for (String email : emails) {
            try {
                authService.inviteUser(email, user, expiryHours);
                results.add(Map.of("email", email, "status", "sent"));
            } catch (Exception e) {
                results.add(Map.of("email", email, "status", "failed", "reason", e.getMessage()));
            }
        }

        long sent = results.stream().filter(r -> "sent".equals(r.get("status"))).count();
        return ResponseEntity.ok(ApiResponse.success(
                sent + " of " + emails.size() + " invitation(s) sent", results));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset link sent to your email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successful"));
    }
}
