package com.devxmanish.taskmanager.controller;

import com.devxmanish.taskmanager.dto.response.ApiResponse;
import com.devxmanish.taskmanager.entity.User;
import com.devxmanish.taskmanager.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllUsers(@AuthenticationPrincipal User user) {
        List<Map<String, Object>> users;

        if (user.getOrganization() != null) {
            // Return only users within the same organization
            users = userRepository.findByOrganizationId(user.getOrganization().getId()).stream()
                    .map(this::toUserMap)
                    .collect(Collectors.toList());
        } else {
            users = userRepository.findAll().stream()
                    .map(this::toUserMap)
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(ApiResponse.success("Users fetched", users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getUser(@PathVariable Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new com.devxmanish.taskmanager.exception.ResourceNotFoundException("User not found"));

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", u.getId());
        map.put("name", u.getName());
        map.put("email", u.getEmail());
        map.put("role", u.getRole().name());
        map.put("createdAt", u.getCreatedAt());
        if (u.getOrganization() != null) {
            map.put("organizationId", u.getOrganization().getId());
            map.put("organizationName", u.getOrganization().getName());
        }

        return ResponseEntity.ok(ApiResponse.success("User fetched", map));
    }

    private Map<String, Object> toUserMap(User u) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", u.getId());
        map.put("name", u.getName());
        map.put("email", u.getEmail());
        map.put("role", u.getRole().name());
        return map;
    }
}
