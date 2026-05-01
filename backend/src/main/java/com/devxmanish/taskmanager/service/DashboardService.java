package com.devxmanish.taskmanager.service;

import com.devxmanish.taskmanager.entity.Task;
import com.devxmanish.taskmanager.entity.User;
import com.devxmanish.taskmanager.entity.enums.Role;
import com.devxmanish.taskmanager.entity.enums.TaskStatus;
import com.devxmanish.taskmanager.repository.ProjectRepository;
import com.devxmanish.taskmanager.repository.TaskRepository;
import com.devxmanish.taskmanager.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class DashboardService {

    private final TaskRepository taskRepo;
    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;

    public DashboardService(TaskRepository taskRepo,
                             ProjectRepository projectRepo,
                             UserRepository userRepo) {
        this.taskRepo = taskRepo;
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
    }

    public Map<String, Object> getDashboardStats(User currentUser) {
        Map<String, Object> stats = new LinkedHashMap<>();

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        Long userId = currentUser.getId();
        Long orgId = currentUser.getOrganization() != null ? currentUser.getOrganization().getId() : null;

        // project count
        long projectCount;
        if (isAdmin && orgId != null) {
            projectCount = projectRepo.countByOrganizationId(orgId);
        } else if (isAdmin) {
            projectCount = projectRepo.count();
        } else {
            projectCount = projectRepo.countProjectsByUserId(userId);
        }
        stats.put("totalProjects", projectCount);

        // task status counts — use DB-level aggregation
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        statusCounts.put("TODO", 0L);
        statusCounts.put("IN_PROGRESS", 0L);
        statusCounts.put("IN_REVIEW", 0L);
        statusCounts.put("DONE", 0L);

        List<Object[]> counts;
        if (isAdmin && orgId != null) {
            counts = taskRepo.countByStatusForOrg(orgId);
        } else if (isAdmin) {
            counts = taskRepo.countByStatusAll();
        } else {
            counts = taskRepo.countByStatusForUser(userId);
        }
        for (Object[] row : counts) {
            TaskStatus status = (TaskStatus) row[0];
            Long count = (Long) row[1];
            statusCounts.put(status.name(), count);
        }
        stats.put("tasksByStatus", statusCounts);

        long totalTasks = statusCounts.values().stream().mapToLong(Long::longValue).sum();
        stats.put("totalTasks", totalTasks);

        // overdue tasks — DB query, not in-memory filtering
        List<Task> overdueTasks;
        if (isAdmin && orgId != null) {
            overdueTasks = taskRepo.findOverdueTasksForOrg(orgId, LocalDate.now());
        } else if (isAdmin) {
            overdueTasks = taskRepo.findAllOverdueTasks(LocalDate.now());
        } else {
            overdueTasks = taskRepo.findOverdueTasks(userId, LocalDate.now());
        }
        stats.put("overdueCount", overdueTasks.size());

        // overdue task details (top 5)
        List<Map<String, Object>> overdueList = overdueTasks.stream()
                .limit(5)
                .map(t -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", t.getId());
                    m.put("title", t.getTitle());
                    m.put("projectName", t.getProject().getName());
                    m.put("dueDate", t.getDueDate());
                    m.put("status", t.getStatus().name());
                    return m;
                }).toList();
        stats.put("overdueTasks", overdueList);

        // recent tasks (last 10) — proper DB query with limit
        List<Task> recentTasks;
        if (isAdmin && orgId != null) {
            recentTasks = taskRepo.findRecentTasksForOrg(orgId).stream()
                    .limit(10).toList();
        } else if (isAdmin) {
            recentTasks = taskRepo.findTop10ByOrderByUpdatedAtDesc();
        } else {
            recentTasks = taskRepo.findRecentTasksForUser(userId).stream()
                    .limit(10).toList();
        }
        List<Map<String, Object>> recentList = recentTasks.stream()
                .map(t -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", t.getId());
                    m.put("title", t.getTitle());
                    m.put("projectName", t.getProject().getName());
                    m.put("status", t.getStatus().name());
                    m.put("priority", t.getPriority().name());
                    m.put("assignedToName", t.getAssignedTo() != null ? t.getAssignedTo().getName() : null);
                    m.put("updatedAt", t.getUpdatedAt());
                    return m;
                }).toList();
        stats.put("recentTasks", recentList);

        // team size (admin only, org-scoped)
        if (isAdmin) {
            if (orgId != null) {
                stats.put("totalMembers", userRepo.countByOrganizationId(orgId));
            } else {
                stats.put("totalMembers", userRepo.count());
            }
        }

        return stats;
    }
}
