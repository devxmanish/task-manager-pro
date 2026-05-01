package com.devxmanish.taskmanager.controller;

import com.devxmanish.taskmanager.dto.request.ProjectRequest;
import com.devxmanish.taskmanager.dto.response.ApiResponse;
import com.devxmanish.taskmanager.entity.User;
import com.devxmanish.taskmanager.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getProjects(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.success("Projects fetched", projectService.getUserProjects(user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createProject(
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.success("Project created", projectService.createProject(request, user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getProject(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.success("Project fetched", projectService.getProjectById(id, user)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.success("Project updated", projectService.updateProject(id, request, user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        projectService.deleteProject(id, user);
        return ResponseEntity.ok(ApiResponse.success("Project deleted"));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse> addMember(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body,
            @AuthenticationPrincipal User user) {
        projectService.addMember(id, body.get("userId"), user);
        return ResponseEntity.ok(ApiResponse.success("Member added to project"));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ApiResponse> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            @AuthenticationPrincipal User user) {
        projectService.removeMember(id, userId, user);
        return ResponseEntity.ok(ApiResponse.success("Member removed from project"));
    }
}
