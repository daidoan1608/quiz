package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.response.CampaignResponse;
import com.fita.vnua.quiz.model.dto.response.NotificationResponse;
import com.fita.vnua.quiz.model.dto.response.RecipientResponse;
import com.fita.vnua.quiz.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface NotificationService {
    @Transactional
    void sendGlobalNotification(String title, String message);

    void sendSubjectNotification(Long subjectId, String subjectName, Long examId);

    @Transactional
    void sendPersonalNotification(UUID userId, String title, String message);

    @Transactional
    void sendBatchNotification(List<UUID> userIds, String title, String message);

    Page<CampaignResponse> getAllCampaigns(
            String keyword,
            String sendType,
            UUID createdBy,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable
    );

    Page<CampaignResponse> getCampaignsForAdminUser(
            String keyword,
            String sendType,
            UUID createdBy,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable,
            User currentUser
    );

    Page<RecipientResponse> getRecipientsByHistoryId(Long historyId, Pageable pageable);

    Page<RecipientResponse> getRecipientsByHistoryIdForAdminUser(Long historyId, Pageable pageable, User currentUser);

    @Transactional
    void deleteHistory(Long historyId);

    // Các hàm sendPersonalNotification, markAsRead... cũng nhớ đổi tham số Long userId -> UUID userId nhé.
    @Transactional(readOnly = true)
    List<NotificationResponse> getNotifications(UUID currentUserId);

    @Transactional(readOnly = true)
    long getUnreadCount(UUID currentUserId);

    @Transactional
    void markAsRead(Long notificationId, UUID currentUserId);

    @Transactional
    void markAllAsRead(UUID userId);
}
