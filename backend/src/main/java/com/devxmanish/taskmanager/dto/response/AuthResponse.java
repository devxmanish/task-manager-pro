package com.devxmanish.taskmanager.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String name;
    private String email;
    private String role;
    private Long userId;
    private Long organizationId;
    private String organizationName;
}
