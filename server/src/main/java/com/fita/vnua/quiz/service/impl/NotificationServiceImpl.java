package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.response.CampaignResponse;
import com.fita.vnua.quiz.model.dto.response.NotificationResponse;
import com.fita.vnua.quiz.model.entity.GlobalNotificationRead;
import com.fita.vnua.quiz.model.entity.Notification;
import com.fita.vnua.quiz.model.entity.NotificationHistory;
import com.fita.vnua.quiz.repository.*;
import com.fita.vnua.quiz.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // =================================================================
    // PHẦN 1: GỬI THÔNG BÁO (TẤT CẢ ĐỀU PHẢI TẠO HISTORY)
    // =================================================================

    @Transactional
    @Override
    public void sendGlobalNotification(String title, String message) {
        // 1. Tạo History
        NotificationHistory history = NotificationHistory.builder()
                .title(title).message(message).sendType("GLOBAL").build();
        historyRepository.save(history);

        // 2. Tạo Notification
        Notification noti = Notification.builder()
                .title(title)
                .message(message)
                .type(Notification.NotificationType.GLOBAL)
                .userId(null)
                .relatedType("SYSTEM")
                .history(history) // Gắn cha
                .isRead(false)
                .build();

        notificationRepository.save(noti);
    }

    @Override
    @Transactional
    public void sendSubjectNotification(Long subjectId, String subjectName, Long examId) {
        List<UUID> userIds = favoriteRepository.findUserIdsBySubjectId(subjectId);
        if (userIds.isEmpty()) return;

        // 1. Tạo History
        NotificationHistory history = NotificationHistory.builder()
                .title("Đề thi mới môn " + subjectName)
                .message("Đã có đề thi mới, hãy vào thử sức ngay!")
                .sendType("SUBJECT_ID:" + subjectId)
                .build();
        historyRepository.save(history);

        // 2. Fan-out
        List<Notification> notifications = new ArrayList<>();
        for (UUID uid : userIds) {
            notifications.add(Notification.builder()
                    .title(history.getTitle())
                    .message(history.getMessage())
                    .type(Notification.NotificationType.PERSONAL)
                    .userId(uid)
                    .relatedId(examId)
                    .relatedType("EXAM")
                    .history(history) // Gắn cha
                    .isRead(false)
                    .build());
        }
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    @Override
    public void sendPersonalNotification(UUID userId, String title, String message) {
        // 1. Cần tạo History để Admin quản lý được cả tin nhắn riêng
        NotificationHistory history = NotificationHistory.builder()
                .title(title)
                .message(message)
                .sendType("PERSONAL")
                .build();
        historyRepository.save(history);

        // 2. Tạo Notification
        Notification noti = Notification.builder()
                .title(title)
                .message(message)
                .type(Notification.NotificationType.PERSONAL)
                .userId(userId)
                .relatedType("PERSONAL_MSG")
                .history(history) // Gắn cha
                .isRead(false)
                .build();

        notificationRepository.save(noti);
    }

    @Transactional
    @Override
    public void sendBatchNotification(List<UUID> userIds, String title, String message) {
        if (userIds == null || userIds.isEmpty()) return;

        // 1. Tạo History (Quan trọng để Admin biết mình đã gửi Batch này)
        NotificationHistory history = NotificationHistory.builder()
                .title(title)
                .message(message)
                .sendType("BATCH")
                .build();
        historyRepository.save(history);

        // 2. Fan-out
        List<Notification> notifications = new ArrayList<>();
        for (UUID uid : userIds) {
            Notification noti = Notification.builder()
                    .title(title)
                    .message(message)
                    .type(Notification.NotificationType.PERSONAL)
                    .userId(uid)
                    .relatedType("BATCH_MSG")
                    .history(history) // Gắn cha
                    .isRead(false)
                    .build();
            notifications.add(noti);
        }
        notificationRepository.saveAll(notifications);
    }

    // =================================================================
    // PHẦN 2: ADMIN QUẢN LÝ (DASHBOARD)
    // =================================================================

    @Override
    public Page<CampaignResponse> getAllCampaigns(String keyword, Pageable pageable) {
        // Lấy danh sách History để hiển thị lên Dashboard
        return historyRepository.searchByTitle(keyword, pageable)
                .map(h -> CampaignResponse.builder()
                        .id(h.getId())
                        .title(h.getTitle())
                        .message(h.getMessage())
                        .sendType(h.getSendType())
                        .createdAt(h.getCreatedAt())
                        .createdBy(h.getCreatedBy())
                        .build());
    }

    @Transactional
    @Override
    public void deleteHistory(Long historyId) {
        // Thu hồi thông báo: Xóa History -> Cascade xóa hết con
        if (historyRepository.existsById(historyId)) {
            historyRepository.deleteById(historyId);
        } else {
            throw new RuntimeException("Chiến dịch không tồn tại");
        }
    }

    // =================================================================
    // PHẦN 3: USER CLIENT (XEM & ĐỌC)
    // =================================================================

    @Transactional(readOnly = true)
    @Override
    public List<NotificationResponse> getNotifications(UUID currentUserId) {
        return notificationRepository.findAllNotificationsForUser(currentUserId);
    }

    @Transactional
    @Override
    public void markAsRead(Long notificationId, UUID currentUserId) {
        Notification noti = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));

        if (noti.getType() == Notification.NotificationType.PERSONAL) {
            if (!noti.getUserId().equals(currentUserId)) {
                throw new RuntimeException("Unauthorized");
            }
            noti.setRead(true);
            notificationRepository.save(noti);

        } else if (noti.getType() == Notification.NotificationType.GLOBAL) {
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
            for (Long notiId : allGlobalIds) {
                GlobalNotificationRead read = new GlobalNotificationRead();
                read.setUserId(userId);
                read.setNotificationId(notiId);
                newReads.add(read);
            }
            globalReadRepository.saveAll(newReads);
        }
    }
}