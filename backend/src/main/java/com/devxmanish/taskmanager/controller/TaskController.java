package com.devxmanish.taskmanager.controller;

import com.devxmanish.taskmanager.dto.request.TaskRequest;
import com.devxmanish.taskmanager.dto.response.ApiResponse;
import com.devxmanish.taskmanager.entity.User;
import com.devxmanish.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse> getProjectTasks(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.success("Tasks fetched", taskService.getProjectTasks(projectId, user)));
    }

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse> getAllUserTasks(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.success("All tasks fetched", taskService.getAllTasksForUser(user)));
    }

    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse> createTask(
            @PathVariable Long projectId,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.success("Task created", taskService.createTask(projectId, request, user)));
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse> getTask(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.success("Task fetched", taskService.getTaskById(id, user)));
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.success("Task updated", taskService.updateTask(id, request, user)));
    }

    @PatchMapping("/tasks/{id}/status")
    public ResponseEntity<ApiResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        taskService.updateTaskStatus(id, body.get("status"), user);
        return ResponseEntity.ok(ApiResponse.success("Task status updated"));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        taskService.deleteTask(id, user);
        return ResponseEntity.ok(ApiResponse.success("Task deleted"));
    }

    @PostMapping("/tasks/{id}/comments")
    public ResponseEntity<ApiResponse> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.success("Comment added", taskService.addComment(id, body.get("content"), user)));
    }
}
