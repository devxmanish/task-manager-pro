package com.devxmanish.taskmanager.repository;

import com.devxmanish.taskmanager.entity.Invitation;
import com.devxmanish.taskmanager.entity.enums.InviteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    List<Invitation> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);

    Optional<Invitation> findByToken(String token);

    Optional<Invitation> findByEmailAndOrganizationIdAndStatus(String email, Long orgId, InviteStatus status);

    boolean existsByEmailAndOrganizationIdAndStatus(String email, Long orgId, InviteStatus status);

    long countByOrganizationIdAndStatus(Long orgId, InviteStatus status);

    // For expiring old invites
    List<Invitation> findByStatusAndExpiresAtBefore(InviteStatus status, LocalDateTime now);
}
