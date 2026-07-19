package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Table(
        name = "admin_user_group",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "group_id"})
)
public class AdminUserGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private AdminGroup group;

    private LocalDateTime assignedAt;

    @PrePersist
    void prePersist() {
        assignedAt = LocalDateTime.now();
    }
}
