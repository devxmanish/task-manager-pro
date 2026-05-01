package com.devxmanish.taskmanager.repository;

import com.devxmanish.taskmanager.entity.Task;
import com.devxmanish.taskmanager.entity.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    List<Task> findByAssignedToId(Long userId);

    List<Task> findByCreatedById(Long userId);

    long countByProjectId(Long projectId);

    long countByAssignedToIdAndStatus(Long userId, TaskStatus status);

    // overdue tasks: due date is before today and not yet completed
    @Query("SELECT t FROM Task t WHERE t.assignedTo.id = :userId " +
           "AND t.dueDate < :today AND t.status <> 'DONE'")
    List<Task> findOverdueTasks(@Param("userId") Long userId,
                                @Param("today") LocalDate today);

    // tasks assigned to user across all their projects
    @Query("SELECT t FROM Task t WHERE t.assignedTo.id = :userId ORDER BY t.createdAt DESC")
    List<Task> findAllByAssignedUser(@Param("userId") Long userId);

    // count by status for a user
    @Query("SELECT t.status, COUNT(t) FROM Task t WHERE t.assignedTo.id = :userId GROUP BY t.status")
    List<Object[]> countByStatusForUser(@Param("userId") Long userId);

    // recent tasks across user's projects
    @Query("SELECT t FROM Task t JOIN t.project p LEFT JOIN p.members pm " +
           "WHERE p.owner.id = :userId OR pm.user.id = :userId " +
           "ORDER BY t.updatedAt DESC")
    List<Task> findRecentTasksForUser(@Param("userId") Long userId);

    // ── Admin-level queries (avoids findAll() in-memory filtering) ──

    @Query("SELECT t.status, COUNT(t) FROM Task t GROUP BY t.status")
    List<Object[]> countByStatusAll();

    @Query("SELECT t FROM Task t WHERE t.dueDate < :today AND t.status <> com.devxmanish.taskmanager.entity.enums.TaskStatus.DONE")
    List<Task> findAllOverdueTasks(@Param("today") LocalDate today);

    List<Task> findTop10ByOrderByUpdatedAtDesc();

    // all tasks for user (across all their projects)
    @Query("SELECT DISTINCT t FROM Task t JOIN t.project p LEFT JOIN p.members pm " +
           "WHERE p.owner.id = :userId OR pm.user.id = :userId OR t.assignedTo.id = :userId " +
           "ORDER BY t.updatedAt DESC")
    List<Task> findAllTasksForUser(@Param("userId") Long userId);

    // ── Org-scoped admin queries ──

    @Query("SELECT t.status, COUNT(t) FROM Task t WHERE t.project.organization.id = :orgId GROUP BY t.status")
    List<Object[]> countByStatusForOrg(@Param("orgId") Long orgId);

    @Query("SELECT t FROM Task t WHERE t.project.organization.id = :orgId " +
           "AND t.dueDate < :today AND t.status <> com.devxmanish.taskmanager.entity.enums.TaskStatus.DONE")
    List<Task> findOverdueTasksForOrg(@Param("orgId") Long orgId, @Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.project.organization.id = :orgId ORDER BY t.updatedAt DESC")
    List<Task> findRecentTasksForOrg(@Param("orgId") Long orgId);
}
