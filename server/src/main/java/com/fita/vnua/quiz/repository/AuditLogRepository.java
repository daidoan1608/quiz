package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop200ByOrderByCreatedAtDesc();

    List<AuditLog> findByEntityTypeAndActionAndActorId(String entityType, String action, UUID actorId);
}
