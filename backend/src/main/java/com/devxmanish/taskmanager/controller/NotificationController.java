package com.devxmanish.taskmanager.controller;

import com.devxmanish.taskmanager.dto.response.ApiResponse;
import com.devxmanish.taskmanager.entity.Notification;
import com.devxmanish.taskmanager.entity.User;
import com.devxmanish.taskmanager.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getNotifications(@AuthenticationPrincipal User user) {
        List<Map<String, Object>> notifications = notificationService
                .getUserNotifications(user.getId())
                .stream()
                .map(n -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", n.getId());
                    map.put("type", n.getType().name());
                    map.put("message", n.getMessage());
                    map.put("referenceId", n.getReferenceId());
                    map.put("isRead", n.getIsRead());
                    map.put("createdAt", n.getCreatedAt());
                    return map;
                }).collect(Collectors.toList());

        long unreadCount = notificationService.getUnreadCount(user.getId());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("notifications", notifications);
        data.put("unreadCount", unreadCount);

        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", data));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Marked as read"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse> markAllAsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}
