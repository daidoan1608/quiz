package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.response.AuditLogResponse;
import com.fita.vnua.quiz.model.entity.AuditLog;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.AuditLogRepository;
import com.fita.vnua.quiz.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {
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
}
