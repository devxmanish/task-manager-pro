package com.devxmanish.taskmanager.repository;

import com.devxmanish.taskmanager.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    boolean existsByProjectIdAndUserId(Long projectId, Long userId);

    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);

    @Modifying
    @Transactional
    void deleteByProjectIdAndUserId(Long projectId, Long userId);
}
