package com.devxmanish.taskmanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyOtpRequest {

    @NotBlank(message = "Verification token is required")
    private String verificationToken;

    @NotBlank(message = "OTP is required")
    private String otp;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Password is required")
    private String password;

    // Optional: provided when creating a new organization
    private String organizationName;

    // Optional: provided when accepting an invite to an existing org
    private String inviteToken;
}
