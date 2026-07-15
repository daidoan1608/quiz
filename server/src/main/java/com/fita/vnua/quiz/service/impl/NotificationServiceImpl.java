package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.response.CampaignResponse;
import com.fita.vnua.quiz.model.dto.response.NotificationResponse;
import com.fita.vnua.quiz.model.dto.response.RealtimeNotificationPayload;
import com.fita.vnua.quiz.model.dto.response.RecipientResponse;
import com.fita.vnua.quiz.model.entity.GlobalNotificationRead;
import com.fita.vnua.quiz.model.entity.Notification;
import com.fita.vnua.quiz.model.entity.NotificationHistory;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.FavoriteRepository;
import com.fita.vnua.quiz.repository.GlobalNotificationReadRepository;
import com.fita.vnua.quiz.repository.NotificationHistoryRepository;
import com.fita.vnua.quiz.repository.NotificationRepository;
import com.fita.vnua.quiz.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationHistoryRepository historyRepository;
    private final NotificationRepository notificationRepository;
    private final GlobalNotificationReadRepository globalReadRepository;
    private final FavoriteRepository favoriteRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    @Override
    public void sendGlobalNotification(String title, String message) {
        NotificationHistory history = NotificationHistory.builder()
                .title(title)
                .message(message)
                .sendType("GLOBAL")
                .createdBy(currentActorId())
                .build();
        historyRepository.save(history);

        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(Notification.NotificationType.GLOBAL)
                .relatedType("SYSTEM")
                .history(history)
                .isRead(false)
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        messagingTemplate.convertAndSend("/topic/notifications/global", RealtimeNotificationPayload.from(savedNotification));
    }

    @Override
    @Transactional
    public void sendSubjectNotification(Long subjectId, String subjectName, Long examId) {
        List<UUID> userIds = favoriteRepository.findUserIdsBySubjectId(subjectId);
        if (userIds.isEmpty()) return;

        NotificationHistory history = NotificationHistory.builder()
                .title("Đề thi mới môn " + subjectName)
                .message("Đã có đề thi mới, hãy vào thử sức ngay!")
                .sendType("SUBJECT_ID:" + subjectId)
                .createdBy(currentActorId())
                .build();
        historyRepository.save(history);

        List<Notification> notifications = new ArrayList<>();
        for (UUID userId : userIds) {
            notifications.add(Notification.builder()
                    .title(history.getTitle())
                    .message(history.getMessage())
                    .type(Notification.NotificationType.PERSONAL)
                    .userId(userId)
                    .relatedId(examId)
                    .relatedType("EXAM")
                    .history(history)
                    .isRead(false)
                    .build());
        }
        notificationRepository.saveAll(notifications)
                .forEach(this::sendPersonalRealtimeNotification);
    }

    @Transactional
    @Override
    public void sendPersonalNotification(UUID userId, String title, String message) {
        NotificationHistory history = NotificationHistory.builder()
                .title(title)
                .message(message)
                .sendType("PERSONAL")
                .createdBy(currentActorId())
                .build();
        historyRepository.save(history);

        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(Notification.NotificationType.PERSONAL)
                .userId(userId)
                .relatedType("PERSONAL_MSG")
                .history(history)
                .isRead(false)
                .build();

        sendPersonalRealtimeNotification(notificationRepository.save(notification));
    }

    @Transactional
    @Override
    public void sendBatchNotification(List<UUID> userIds, String title, String message) {
        if (userIds == null || userIds.isEmpty()) return;

        NotificationHistory history = NotificationHistory.builder()
                .title(title)
                .message(message)
                .sendType("BATCH")
                .createdBy(currentActorId())
                .build();
        historyRepository.save(history);

        List<Notification> notifications = new ArrayList<>();
        for (UUID userId : userIds) {
            notifications.add(Notification.builder()
                    .title(title)
                    .message(message)
                    .type(Notification.NotificationType.PERSONAL)
                    .userId(userId)
                    .relatedType("BATCH_MSG")
                    .history(history)
                    .isRead(false)
                    .build());
        }
        notificationRepository.saveAll(notifications)
                .forEach(this::sendPersonalRealtimeNotification);
    }

    @Override
    public Page<CampaignResponse> getAllCampaigns(
            String keyword,
            String sendType,
            UUID createdBy,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable
    ) {
        return historyRepository.searchCampaigns(keyword, sendType, createdBy, fromDate, toDate, pageable)
                .map(h -> CampaignResponse.builder()
                        .id(h.getId())
                        .title(h.getTitle())
                        .message(h.getMessage())
                        .sendType(h.getSendType())
                        .createdAt(h.getCreatedAt())
                        .createdBy(h.getCreatedBy())
                        .build());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RecipientResponse> getRecipientsByHistoryId(Long historyId, Pageable pageable) {
        return notificationRepository.findRecipientsByHistoryId(historyId, pageable);
    }

    @Transactional
    @Override
    public void deleteHistory(Long historyId) {
        if (!historyRepository.existsById(historyId)) {
            throw new CustomApiException("Chiến dịch không tồn tại", HttpStatus.NOT_FOUND);
        }
        historyRepository.deleteById(historyId);
    }

    @Transactional(readOnly = true)
    @Override
    public List<NotificationResponse> getNotifications(UUID currentUserId) {
        return notificationRepository.findAllNotificationsForUser(currentUserId);
    }

    @Transactional
    @Override
    public void markAsRead(Long notificationId, UUID currentUserId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy thông báo", HttpStatus.NOT_FOUND));

        if (notification.getType() == Notification.NotificationType.PERSONAL) {
            if (!notification.getUserId().equals(currentUserId)) {
                throw new CustomApiException("Bạn không có quyền đọc thông báo này", HttpStatus.FORBIDDEN);
            }
            notification.setRead(true);
            notificationRepository.save(notification);
            return;
        }

        if (notification.getType() == Notification.NotificationType.GLOBAL) {
            boolean isAlreadyRead = globalReadRepository
                    .existsByUserIdAndNotificationId(currentUserId, notificationId);

            if (!isAlreadyRead) {
                GlobalNotificationRead readRecord = new GlobalNotificationRead();
                readRecord.setUserId(currentUserId);
                readRecord.setNotificationId(notificationId);
                globalReadRepository.save(readRecord);
            }
        }
    }

    @Transactional
    @Override
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllPersonalAsRead(userId);

        List<Long> allGlobalIds = notificationRepository.findAllGlobalNotificationIds();
        List<Long> alreadyReadIds = globalReadRepository.findAllReadNotificationIds(userId);
        allGlobalIds.removeAll(alreadyReadIds);

        if (!allGlobalIds.isEmpty()) {
            List<GlobalNotificationRead> newReads = new ArrayList<>();
            for (Long notificationId : allGlobalIds) {
                GlobalNotificationRead read = new GlobalNotificationRead();
                read.setUserId(userId);
                read.setNotificationId(notificationId);
                newReads.add(read);
            }
            globalReadRepository.saveAll(newReads);
        }
    }

    private UUID currentActorId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return user.getUserId();
        }
        return null;
    }

    private void sendPersonalRealtimeNotification(Notification notification) {
        if (notification.getUserId() == null) {
            return;
        }
        messagingTemplate.convertAndSendToUser(
                notification.getUserId().toString(),
                "/queue/notifications",
                RealtimeNotificationPayload.from(notification)
        );
    }
}
