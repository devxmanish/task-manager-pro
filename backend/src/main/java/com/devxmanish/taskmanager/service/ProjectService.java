package com.devxmanish.taskmanager.service;

import com.devxmanish.taskmanager.dto.request.ProjectRequest;
import com.devxmanish.taskmanager.entity.Project;
import com.devxmanish.taskmanager.entity.ProjectMember;
import com.devxmanish.taskmanager.entity.User;
import com.devxmanish.taskmanager.entity.enums.NotificationType;
import com.devxmanish.taskmanager.entity.enums.Role;
import com.devxmanish.taskmanager.exception.ResourceNotFoundException;
import com.devxmanish.taskmanager.exception.UnauthorizedException;
import com.devxmanish.taskmanager.repository.ProjectMemberRepository;
import com.devxmanish.taskmanager.repository.ProjectRepository;
import com.devxmanish.taskmanager.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepo;
    private final ProjectMemberRepository memberRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final WebSocketEventService wsEventService;

    public ProjectService(ProjectRepository projectRepo,
                          ProjectMemberRepository memberRepo,
                          UserRepository userRepo,
                          NotificationService notificationService,
                          EmailService emailService,
                          WebSocketEventService wsEventService) {
        this.projectRepo = projectRepo;
        this.memberRepo = memberRepo;
        this.userRepo = userRepo;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.wsEventService = wsEventService;
    }


    public List<Map<String, Object>> getUserProjects(User currentUser) {
        List<Project> projects;
        if (currentUser.getRole() == Role.ADMIN && currentUser.getOrganization() != null) {
            // Admin sees all projects in their org
            projects = projectRepo.findByOrganizationId(currentUser.getOrganization().getId());
        } else if (currentUser.getRole() == Role.ADMIN) {
            projects = projectRepo.findAll();
        } else {
            projects = projectRepo.findProjectsByUserId(currentUser.getId());
        }

        return projects.stream().map(this::toProjectMap).collect(Collectors.toList());
    }

    public Map<String, Object> getProjectById(Long projectId, User currentUser) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // check access: admin or owner or member
        if (currentUser.getRole() != Role.ADMIN
                && !project.getOwner().getId().equals(currentUser.getId())
                && !memberRepo.existsByProjectIdAndUserId(projectId, currentUser.getId())) {
            throw new UnauthorizedException("You don't have access to this project");
        }

        return toProjectDetailMap(project);
    }

    public Map<String, Object> createProject(ProjectRequest request, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can create projects");
        }

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(currentUser)
                .organization(currentUser.getOrganization())
                .build();
        project = projectRepo.save(project);

        Long orgId = project.getOrganization() != null ? project.getOrganization().getId() : null;
        wsEventService.broadcastProjectEvent("PROJECT_CREATED", project.getId(), orgId, currentUser.getId());

        return toProjectMap(project);
    }

    public Map<String, Object> updateProject(Long projectId, ProjectRequest request, User currentUser) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (currentUser.getRole() != Role.ADMIN
                && !project.getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Only admins or project owner can update this project");
        }

        project.setName(request.getName());
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        project = projectRepo.save(project);

        Long orgId = project.getOrganization() != null ? project.getOrganization().getId() : null;
        wsEventService.broadcastProjectEvent("PROJECT_UPDATED", project.getId(), orgId, currentUser.getId());

        return toProjectMap(project);
    }

    @Transactional
    public void deleteProject(Long projectId, User currentUser) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (currentUser.getRole() != Role.ADMIN
                && !project.getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Only admins or project owner can delete this project");
        }

        Long orgId = project.getOrganization() != null ? project.getOrganization().getId() : null;
        projectRepo.delete(project);
        wsEventService.broadcastProjectEvent("PROJECT_DELETED", projectId, orgId, currentUser.getId());
    }

    @Transactional
    public void addMember(Long projectId, Long userId, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can manage project members");
        }

        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        User userToAdd = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (memberRepo.existsByProjectIdAndUserId(projectId, userId)) {
            throw new IllegalArgumentException("User is already a member of this project");
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(userToAdd)
                .build();
        memberRepo.save(member);

        // send notification
        notificationService.sendNotification(
                userToAdd,
                NotificationType.MEMBER_ADDED,
                "You were added to project: " + project.getName(),
                projectId
        );

        // send email
        emailService.sendMemberAddedEmail(
                userToAdd.getEmail(),
                project.getName(),
                currentUser.getName()
        );

        // broadcast WebSocket event
        Long orgId = project.getOrganization() != null ? project.getOrganization().getId() : null;
        wsEventService.broadcastProjectEvent("MEMBER_CHANGED", projectId, orgId, currentUser.getId());
    }

    @Transactional
    public void removeMember(Long projectId, Long userId, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can manage project members");
        }

        if (!memberRepo.existsByProjectIdAndUserId(projectId, userId)) {
            throw new ResourceNotFoundException("User is not a member of this project");
        }

        memberRepo.deleteByProjectIdAndUserId(projectId, userId);

        // notify removed user
        User removedUser = userRepo.findById(userId).orElse(null);
        Project project = projectRepo.findById(projectId).orElse(null);
        if (removedUser != null && project != null) {
            notificationService.sendNotification(
                    removedUser,
                    NotificationType.MEMBER_REMOVED,
                    "You were removed from project: " + project.getName(),
                    projectId
            );

            // send email
            emailService.sendMemberRemovedEmail(removedUser.getEmail(), project.getName());

            // broadcast WebSocket event
            Long orgId = project.getOrganization() != null ? project.getOrganization().getId() : null;
            wsEventService.broadcastProjectEvent("MEMBER_CHANGED", projectId, orgId, currentUser.getId());
        }
    }

    // ── Mapper helpers ──

    private Map<String, Object> toProjectMap(Project p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("name", p.getName());
        map.put("description", p.getDescription());
        map.put("status", p.getStatus());
        map.put("ownerName", p.getOwner().getName());
        map.put("ownerId", p.getOwner().getId());
        map.put("memberCount", p.getMembers() != null ? p.getMembers().size() : 0);
        map.put("taskCount", p.getTasks() != null ? p.getTasks().size() : 0);
        map.put("createdAt", p.getCreatedAt());
        return map;
    }

    private Map<String, Object> toProjectDetailMap(Project p) {
        Map<String, Object> map = toProjectMap(p);

        List<Map<String, Object>> membersList = new ArrayList<>();
        if (p.getMembers() != null) {
            for (ProjectMember pm : p.getMembers()) {
                Map<String, Object> memberMap = new LinkedHashMap<>();
                memberMap.put("id", pm.getUser().getId());
                memberMap.put("name", pm.getUser().getName());
                memberMap.put("email", pm.getUser().getEmail());
                memberMap.put("role", pm.getUser().getRole().name());
                memberMap.put("joinedAt", pm.getJoinedAt());
                membersList.add(memberMap);
            }
        }
        map.put("members", membersList);

        return map;
    }
}
