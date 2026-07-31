package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.response.AuditLogResponse;
import com.fita.vnua.quiz.model.entity.AuditLog;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.AuditLogRepository;
import com.fita.vnua.quiz.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {
    private static final int ENTITY_ID_MAX_LENGTH = 64;

    private final AuditLogRepository auditLogRepository;

    @Override
    public void record(String action, String entityType, Object entityId, User actor, String description) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(String.valueOf(entityId));
        log.setDescription(description);
        if (actor != null) {
            log.setActorId(actor.getUserId());
            log.setActorUsername(actor.getUsername());
        }
        auditLogRepository.save(log);
    }

    @Override
    public void recordSecurityEvent(String action, String entityId, String description) {
        try {
            AuditLog log = new AuditLog();
            log.setAction(action);
            log.setEntityType("SECURITY");
            log.setEntityId(truncate(entityId, ENTITY_ID_MAX_LENGTH));
            log.setDescription(description);
            auditLogRepository.save(log);
        } catch (RuntimeException ex) {
            log.warn("Failed to record security audit event action={}", action, ex);
        }
    }

    @Override
    public List<AuditLogResponse> latest() {
        return auditLogRepository.findTop200ByOrderByCreatedAtDesc().stream()
                .map(log -> new AuditLogResponse(
                        log.getAuditLogId(),
                        log.getAction(),
                        log.getEntityType(),
                        log.getEntityId(),
                        log.getActorId(),
                        log.getActorUsername(),
                        log.getDescription(),
                        log.getCreatedAt()))
                .toList();
    }

    private String truncate(String value, int maxLength) {
        if (value == null) {
            return "unknown";
        }
        if (value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
