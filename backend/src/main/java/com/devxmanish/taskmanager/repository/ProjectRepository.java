package com.devxmanish.taskmanager.repository;

import com.devxmanish.taskmanager.entity.Project;
import com.devxmanish.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOwner(User owner);

    // fetch projects where user is owner OR a member
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members pm " +
           "WHERE p.owner.id = :userId OR pm.user.id = :userId")
    List<Project> findProjectsByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(p) FROM Project p LEFT JOIN p.members pm " +
           "WHERE p.owner.id = :userId OR pm.user.id = :userId")
    long countProjectsByUserId(@Param("userId") Long userId);

    // ── Org-scoped queries ──

    List<Project> findByOrganizationId(Long organizationId);

    long countByOrganizationId(Long organizationId);
}
