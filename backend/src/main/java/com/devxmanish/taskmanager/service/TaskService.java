package com.devxmanish.taskmanager.service;

import com.devxmanish.taskmanager.dto.request.TaskRequest;
import com.devxmanish.taskmanager.entity.*;
import com.devxmanish.taskmanager.entity.enums.*;
import com.devxmanish.taskmanager.exception.ResourceNotFoundException;
import com.devxmanish.taskmanager.exception.UnauthorizedException;
import com.devxmanish.taskmanager.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepo;
    private final ProjectRepository projectRepo;
    private final ProjectMemberRepository memberRepo;
    private final UserRepository userRepo;
    private final TaskCommentRepository commentRepo;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final WebSocketEventService wsEventService;

    public TaskService(TaskRepository taskRepo, ProjectRepository projectRepo,
                       ProjectMemberRepository memberRepo, UserRepository userRepo,
                       TaskCommentRepository commentRepo,
                       NotificationService notificationService,
                       EmailService emailService,
                       WebSocketEventService wsEventService) {
        this.taskRepo = taskRepo;
        this.projectRepo = projectRepo;
        this.memberRepo = memberRepo;
        this.userRepo = userRepo;
        this.commentRepo = commentRepo;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.wsEventService = wsEventService;
    }

    public List<Map<String, Object>> getProjectTasks(Long projectId, User currentUser) {
        verifyProjectAccess(projectId, currentUser);
        return taskRepo.findByProjectId(projectId).stream()
                .map(this::toTaskMap)
                .collect(Collectors.toList());
    }

    /**
     * Returns all tasks the user has access to (admin = all in org, member = own projects)
     */
    public List<Map<String, Object>> getAllTasksForUser(User currentUser) {
        List<Task> tasks;
        if (currentUser.getRole() == Role.ADMIN && currentUser.getOrganization() != null) {
            tasks = taskRepo.findRecentTasksForOrg(currentUser.getOrganization().getId());
        } else if (currentUser.getRole() == Role.ADMIN) {
            tasks = taskRepo.findAll();
        } else {
            tasks = taskRepo.findAllTasksForUser(currentUser.getId());
        }
        return tasks.stream().map(this::toTaskMap).collect(Collectors.toList());
    }

    public Map<String, Object> getTaskById(Long taskId, User currentUser) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        verifyProjectAccess(task.getProject().getId(), currentUser);

        Map<String, Object> taskMap = toTaskMap(task);

        // attach comments
        List<Map<String, Object>> comments = commentRepo.findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream().map(c -> {
                    Map<String, Object> cm = new LinkedHashMap<>();
                    cm.put("id", c.getId());
                    cm.put("content", c.getContent());
                    cm.put("userName", c.getUser().getName());
                    cm.put("userId", c.getUser().getId());
                    cm.put("createdAt", c.getCreatedAt());
                    return cm;
                }).collect(Collectors.toList());
        taskMap.put("comments", comments);

        return taskMap;
    }

    @Transactional
    public Map<String, Object> createTask(Long projectId, TaskRequest request, User currentUser) {
        verifyProjectAccess(projectId, currentUser);

        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .project(project)
                .createdBy(currentUser)
                .build();

        if (request.getPriority() != null) {
            task.setPriority(Priority.valueOf(request.getPriority()));
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }

        // handle assignment
        if (request.getAssignedTo() != null) {
            User assignee = userRepo.findById(request.getAssignedTo())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found"));
            task.setAssignedTo(assignee);
        }

        task = taskRepo.save(task);

        // notify assignee
        if (task.getAssignedTo() != null && !task.getAssignedTo().getId().equals(currentUser.getId())) {
            notificationService.sendNotification(
                    task.getAssignedTo(),
                    NotificationType.TASK_ASSIGNED,
                    currentUser.getName() + " assigned you: " + task.getTitle(),
                    task.getId()
            );
            emailService.sendTaskAssignmentEmail(
                    task.getAssignedTo().getEmail(),
                    task.getTitle(),
                    project.getName(),
                    currentUser.getName()
            );
        }

        // broadcast WebSocket event
        Long orgId = project.getOrganization() != null ? project.getOrganization().getId() : null;
        wsEventService.broadcastTaskEvent("TASK_CREATED", task.getId(), projectId, orgId, currentUser.getId());

        return toTaskMap(task);
    }

    @Transactional
    public Map<String, Object> updateTask(Long taskId, TaskRequest request, User currentUser) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        verifyProjectAccess(task.getProject().getId(), currentUser);

        task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getPriority() != null) task.setPriority(Priority.valueOf(request.getPriority()));

        // status change
        if (request.getStatus() != null) {
            TaskStatus newStatus = TaskStatus.valueOf(request.getStatus());
            if (task.getStatus() != newStatus) {
                TaskStatus oldStatus = task.getStatus();
                task.setStatus(newStatus);
                // notify if someone else changed status
                if (task.getAssignedTo() != null && !task.getAssignedTo().getId().equals(currentUser.getId())) {
                    notificationService.sendNotification(
                            task.getAssignedTo(),
                            NotificationType.STATUS_CHANGED,
                            task.getTitle() + " moved to " + newStatus.name(),
                            task.getId()
                    );
                    emailService.sendTaskStatusEmail(
                            task.getAssignedTo().getEmail(),
                            task.getTitle(),
                            task.getProject().getName(),
                            newStatus.name(),
                            currentUser.getName()
                    );
                }
            }
        }

        // reassignment
        if (request.getAssignedTo() != null) {
            Long oldAssigneeId = task.getAssignedTo() != null ? task.getAssignedTo().getId() : null;
            if (!request.getAssignedTo().equals(oldAssigneeId)) {
                User newAssignee = userRepo.findById(request.getAssignedTo())
                        .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found"));
                task.setAssignedTo(newAssignee);

                if (!newAssignee.getId().equals(currentUser.getId())) {
                    notificationService.sendNotification(
                            newAssignee,
                            NotificationType.TASK_ASSIGNED,
                            currentUser.getName() + " assigned you: " + task.getTitle(),
                            task.getId()
                    );
                    emailService.sendTaskAssignmentEmail(
                            newAssignee.getEmail(),
                            task.getTitle(),
                            task.getProject().getName(),
                            currentUser.getName()
                    );
                }
            }
        }

        task = taskRepo.save(task);

        // broadcast WebSocket event
        Long orgId = task.getProject().getOrganization() != null ? task.getProject().getOrganization().getId() : null;
        wsEventService.broadcastTaskEvent("TASK_UPDATED", task.getId(), task.getProject().getId(), orgId, currentUser.getId());

        return toTaskMap(task);
    }

    public void updateTaskStatus(Long taskId, String status, User currentUser) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        verifyProjectAccess(task.getProject().getId(), currentUser);

        TaskStatus newStatus = TaskStatus.valueOf(status);
        task.setStatus(newStatus);
        taskRepo.save(task);

        // notify relevant parties
        User owner = task.getProject().getOwner();
        if (!owner.getId().equals(currentUser.getId())) {
            notificationService.sendNotification(
                    owner,
                    NotificationType.STATUS_CHANGED,
                    currentUser.getName() + " changed \"" + task.getTitle() + "\" to " + newStatus.name(),
                    task.getId()
            );
            emailService.sendTaskStatusEmail(
                    owner.getEmail(),
                    task.getTitle(),
                    task.getProject().getName(),
                    newStatus.name(),
                    currentUser.getName()
            );
        }

        // also notify the assignee if different from owner and current user
        if (task.getAssignedTo() != null
                && !task.getAssignedTo().getId().equals(currentUser.getId())
                && !task.getAssignedTo().getId().equals(owner.getId())) {
            notificationService.sendNotification(
                    task.getAssignedTo(),
                    NotificationType.STATUS_CHANGED,
                    currentUser.getName() + " changed \"" + task.getTitle() + "\" to " + newStatus.name(),
                    task.getId()
            );
        }

        // broadcast WebSocket event
        Long orgId = task.getProject().getOrganization() != null ? task.getProject().getOrganization().getId() : null;
        wsEventService.broadcastTaskEvent("TASK_STATUS_CHANGED", task.getId(), task.getProject().getId(), orgId, currentUser.getId());
    }

    @Transactional
    public void deleteTask(Long taskId, User currentUser) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        Long projectId = task.getProject().getId();
        Long orgId = task.getProject().getOrganization() != null ? task.getProject().getOrganization().getId() : null;

        // only admin, project owner, or task creator can delete
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isOwner = task.getProject().getOwner().getId().equals(currentUser.getId());
        boolean isCreator = task.getCreatedBy().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner && !isCreator) {
            throw new UnauthorizedException("You don't have permission to delete this task");
        }

        taskRepo.delete(task);

        // broadcast WebSocket event
        wsEventService.broadcastTaskEvent("TASK_DELETED", taskId, projectId, orgId, currentUser.getId());
    }

    @Transactional
    public Map<String, Object> addComment(Long taskId, String content, User currentUser) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        verifyProjectAccess(task.getProject().getId(), currentUser);

        TaskComment comment = TaskComment.builder()
                .task(task)
                .user(currentUser)
                .content(content)
                .build();
        comment = commentRepo.save(comment);

        // notify task assignee about new comment
        if (task.getAssignedTo() != null && !task.getAssignedTo().getId().equals(currentUser.getId())) {
            notificationService.sendNotification(
                    task.getAssignedTo(),
                    NotificationType.COMMENT_ADDED,
                    currentUser.getName() + " commented on: " + task.getTitle(),
                    task.getId()
            );
            emailService.sendCommentEmail(
                    task.getAssignedTo().getEmail(),
                    task.getTitle(),
                    currentUser.getName(),
                    content.length() > 100 ? content.substring(0, 100) + "..." : content
            );
        }

        // also notify task creator if different
        if (task.getCreatedBy() != null
                && !task.getCreatedBy().getId().equals(currentUser.getId())
                && (task.getAssignedTo() == null || !task.getCreatedBy().getId().equals(task.getAssignedTo().getId()))) {
            notificationService.sendNotification(
                    task.getCreatedBy(),
                    NotificationType.COMMENT_ADDED,
                    currentUser.getName() + " commented on: " + task.getTitle(),
                    task.getId()
            );
        }

        // broadcast WebSocket event
        Long orgId = task.getProject().getOrganization() != null ? task.getProject().getOrganization().getId() : null;
        wsEventService.broadcastTaskEvent("COMMENT_ADDED", task.getId(), task.getProject().getId(), orgId, currentUser.getId());

        Map<String, Object> cm = new LinkedHashMap<>();
        cm.put("id", comment.getId());
        cm.put("content", comment.getContent());
        cm.put("userName", currentUser.getName());
        cm.put("userId", currentUser.getId());
        cm.put("createdAt", comment.getCreatedAt());
        return cm;
    }

    // ── helpers ──

    private void verifyProjectAccess(Long projectId, User user) {
        if (user.getRole() == Role.ADMIN) return;

        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.getOwner().getId().equals(user.getId())
                && !memberRepo.existsByProjectIdAndUserId(projectId, user.getId())) {
            throw new UnauthorizedException("You don't have access to this project");
        }
    }

    private Map<String, Object> toTaskMap(Task t) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", t.getId());
        map.put("title", t.getTitle());
        map.put("description", t.getDescription());
        map.put("projectId", t.getProject().getId());
        map.put("projectName", t.getProject().getName());
        map.put("status", t.getStatus().name());
        map.put("priority", t.getPriority().name());
        map.put("dueDate", t.getDueDate());
        map.put("createdByName", t.getCreatedBy().getName());
        map.put("createdById", t.getCreatedBy().getId());
        if (t.getAssignedTo() != null) {
            map.put("assignedToName", t.getAssignedTo().getName());
            map.put("assignedToId", t.getAssignedTo().getId());
        } else {
            map.put("assignedToName", null);
            map.put("assignedToId", null);
        }
        map.put("commentCount", t.getComments() != null ? t.getComments().size() : 0);
        map.put("createdAt", t.getCreatedAt());
        map.put("updatedAt", t.getUpdatedAt());
        return map;
    }
}
