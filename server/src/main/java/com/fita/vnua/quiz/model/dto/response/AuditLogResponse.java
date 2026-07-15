package com.fita.vnua.quiz.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class AuditLogResponse {
    private Long auditLogId;
    private String action;
    private String entityType;
    private String entityId;
    private UUID actorId;
    private String actorUsername;
    private String description;
    private LocalDateTime createdAt;
}
