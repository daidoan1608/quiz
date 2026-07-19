package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.request.BatchNotificationRequest;
import com.fita.vnua.quiz.model.dto.request.GlobalNotificationRequest;
import com.fita.vnua.quiz.model.dto.request.PersonalNotificationRequest;
import com.fita.vnua.quiz.model.dto.request.SubjectNotificationRequest;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.dto.response.CampaignResponse;
import com.fita.vnua.quiz.model.dto.response.RecipientResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final NotificationService notificationService;

    @PostMapping("/global")
    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'NOTIFICATION', 'SEND', 'GLOBAL', null)")
    public ResponseEntity<ApiResponse<Object>> createGlobal(@RequestBody GlobalNotificationRequest request) {
        notificationService.sendGlobalNotification(request.getTitle(), request.getMessage());
        return ResponseEntity.ok(ApiResponse.success("Đã gửi thông báo toàn hệ thống", null));
    }

    @PostMapping("/personal")
    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'NOTIFICATION', 'SEND', 'GLOBAL', null) and @adminCapabilityService.hasPermission(principal, 'NOTIFICATION', 'VIEW_RECIPIENTS', 'GLOBAL', null)")
    public ResponseEntity<ApiResponse<Object>> createPersonal(@RequestBody PersonalNotificationRequest request) {
        notificationService.sendPersonalNotification(request.getUserId(), request.getTitle(), request.getMessage());
        return ResponseEntity.ok(ApiResponse.success("Đã gửi thông báo cá nhân", null));
    }

    @PostMapping("/subject")
    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'NOTIFICATION', 'SEND', 'SUBJECT', #request.subjectId)")
    public ResponseEntity<ApiResponse<Object>> createSubjectManual(@RequestBody SubjectNotificationRequest request) {
        notificationService.sendSubjectNotification(request.getSubjectId(), request.getSubjectName(), request.getExamId());
        return ResponseEntity.ok(ApiResponse.success("Đã gửi thông báo cho nhóm môn học", null));
    }

    @PostMapping("/batch")
    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'NOTIFICATION', 'SEND', 'GLOBAL', null) and @adminCapabilityService.hasPermission(principal, 'NOTIFICATION', 'VIEW_RECIPIENTS', 'GLOBAL', null)")
    public ResponseEntity<ApiResponse<Object>> createBatch(@RequestBody BatchNotificationRequest request) {
        notificationService.sendBatchNotification(request.getUserIds(), request.getTitle(), request.getMessage());
        return ResponseEntity.ok(ApiResponse.success("Đã gửi thông báo cho " + request.getUserIds().size() + " người dùng", null));
    }

    @GetMapping("/campaigns")
    @PreAuthorize("@adminCapabilityService.hasAnyPermission(principal, 'NOTIFICATION', 'VIEW')")
    public ResponseEntity<Page<CampaignResponse>> getAllCampaigns(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sendType,
            @RequestParam(required = false) UUID createdBy,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(notificationService.getCampaignsForAdminUser(
                keyword,
                sendType,
                createdBy,
                fromDate,
                toDate,
                pageable,
                currentUser
        ));
    }

    @GetMapping("/history/{id}/recipients")
    @PreAuthorize("@adminCapabilityService.hasAnyPermission(principal, 'NOTIFICATION', 'VIEW_RECIPIENTS')")
    public ResponseEntity<Page<RecipientResponse>> getRecipients(
            @PathVariable Long id,
            Pageable pageable,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(notificationService.getRecipientsByHistoryIdForAdminUser(id, pageable, currentUser));
    }

    @DeleteMapping("/history/{id}")
    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'NOTIFICATION', 'RECALL', 'GLOBAL', null)")
    public ResponseEntity<ApiResponse<Object>> recallNotification(@PathVariable Long id) {
        notificationService.deleteHistory(id);
        return ResponseEntity.ok(ApiResponse.success("Đã thu hồi chiến dịch thông báo", null));
    }
}
