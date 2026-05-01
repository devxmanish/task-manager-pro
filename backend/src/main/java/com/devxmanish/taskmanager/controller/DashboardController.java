package com.devxmanish.taskmanager.controller;

import com.devxmanish.taskmanager.dto.response.ApiResponse;
import com.devxmanish.taskmanager.entity.User;
import com.devxmanish.taskmanager.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getStats(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.success("Dashboard stats", dashboardService.getDashboardStats(user)));
    }
}
