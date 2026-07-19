package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.dto.response.AuditLogResponse;
import com.fita.vnua.quiz.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/audit-logs")
public class AuditLogController {
    private final AuditLogService auditLogService;

    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'AUDIT_LOG', 'VIEW', 'GLOBAL', null)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.success("Lấy nhật ký thao tác thành công", auditLogService.latest()));
    }
}
