package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.response.AuditLogResponse;
import com.fita.vnua.quiz.model.entity.User;

import java.util.List;

public interface AuditLogService {
    void record(String action, String entityType, Object entityId, User actor, String description);

    void recordSecurityEvent(String action, String entityId, String description);

    List<AuditLogResponse> latest();
}
