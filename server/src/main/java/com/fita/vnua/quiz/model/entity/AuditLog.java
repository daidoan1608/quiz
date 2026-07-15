package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Table(name = "audit_log")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long auditLogId;

    @Column(nullable = false, length = 32)
    private String action;

    @Column(nullable = false, length = 32)
    private String entityType;

    @Column(nullable = false, length = 64)
    private String entityId;

    private UUID actorId;

    private String actorUsername;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
