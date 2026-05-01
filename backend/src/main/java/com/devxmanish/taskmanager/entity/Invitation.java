package com.devxmanish.taskmanager.entity;

import com.devxmanish.taskmanager.entity.enums.InviteStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "invitations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InviteStatus status = InviteStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by_id", nullable = false)
    private User invitedBy;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private LocalDateTime acceptedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
