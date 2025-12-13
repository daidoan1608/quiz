package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.response.CampaignResponse;
import com.fita.vnua.quiz.model.dto.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

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

    Page<CampaignResponse> getAllCampaigns(String keyword, Pageable pageable);

    @Transactional
    void deleteHistory(Long historyId);

    // Các hàm sendPersonalNotification, markAsRead... cũng nhớ đổi tham số Long userId -> UUID userId nhé.
    @Transactional(readOnly = true)
    List<NotificationResponse> getNotifications(UUID currentUserId);

    @Transactional
    void markAsRead(Long notificationId, UUID currentUserId);

    @Transactional
    void markAllAsRead(UUID userId);
}
