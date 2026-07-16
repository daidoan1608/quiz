package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.response.RealtimeNotificationPayload;
import com.fita.vnua.quiz.model.entity.Notification;
import com.fita.vnua.quiz.model.entity.NotificationHistory;
import com.fita.vnua.quiz.repository.FavoriteRepository;
import com.fita.vnua.quiz.repository.GlobalNotificationReadRepository;
import com.fita.vnua.quiz.repository.NotificationHistoryRepository;
import com.fita.vnua.quiz.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationHistoryRepository historyRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private GlobalNotificationReadRepository globalReadRepository;

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    @Test
    void sendGlobalNotificationPublishesGlobalTopic() {
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification notification = invocation.getArgument(0);
            notification.setId(10L);
            return notification;
        });

        notificationService.sendGlobalNotification("System", "Maintenance tonight");

        ArgumentCaptor<RealtimeNotificationPayload> payloadCaptor =
                ArgumentCaptor.forClass(RealtimeNotificationPayload.class);
        verify(messagingTemplate).convertAndSend(eq("/topic/notifications/global"), payloadCaptor.capture());
        assertThat(payloadCaptor.getValue().getId()).isEqualTo(10L);
        assertThat(payloadCaptor.getValue().getTitle()).isEqualTo("System");
        assertThat(payloadCaptor.getValue().getType()).isEqualTo("GLOBAL");
        assertThat(payloadCaptor.getValue().getUnreadDelta()).isEqualTo(1);
    }

    @Test
    void sendPersonalNotificationPublishesOnlyTargetUserQueue() {
        UUID userId = UUID.randomUUID();
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification notification = invocation.getArgument(0);
            notification.setId(20L);
            return notification;
        });

        notificationService.sendPersonalNotification(userId, "Hello", "Private message");

        ArgumentCaptor<RealtimeNotificationPayload> payloadCaptor =
                ArgumentCaptor.forClass(RealtimeNotificationPayload.class);
        verify(messagingTemplate).convertAndSendToUser(
                eq(userId.toString()),
                eq("/queue/notifications"),
                payloadCaptor.capture()
        );
        assertThat(payloadCaptor.getValue().getId()).isEqualTo(20L);
        assertThat(payloadCaptor.getValue().getType()).isEqualTo("PERSONAL");
        assertThat(payloadCaptor.getValue().getUnreadDelta()).isEqualTo(1);
    }

    @Test
    void sendBatchNotificationPublishesToEachSelectedUser() {
        UUID firstUserId = UUID.randomUUID();
        UUID secondUserId = UUID.randomUUID();
        when(notificationRepository.saveAll(any())).thenAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            List<Notification> notifications = invocation.getArgument(0);
            long nextId = 30L;
            for (Notification notification : notifications) {
                notification.setId(nextId++);
            }
            return notifications;
        });

        notificationService.sendBatchNotification(List.of(firstUserId, secondUserId), "Batch", "Message");

        verify(messagingTemplate).convertAndSendToUser(
                eq(firstUserId.toString()),
                eq("/queue/notifications"),
                any(RealtimeNotificationPayload.class)
        );
        verify(messagingTemplate).convertAndSendToUser(
                eq(secondUserId.toString()),
                eq("/queue/notifications"),
                any(RealtimeNotificationPayload.class)
        );
    }

    @Test
    void sendSubjectNotificationPublishesToFavoriteUsers() {
        UUID firstUserId = UUID.randomUUID();
        UUID secondUserId = UUID.randomUUID();
        when(favoriteRepository.findUserIdsBySubjectId(7L)).thenReturn(List.of(firstUserId, secondUserId));
        when(notificationRepository.saveAll(any())).thenAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            List<Notification> notifications = invocation.getArgument(0);
            long nextId = 40L;
            for (Notification notification : notifications) {
                notification.setId(nextId++);
            }
            return notifications;
        });

        notificationService.sendSubjectNotification(7L, "Math", 99L);

        verify(historyRepository).save(any(NotificationHistory.class));
        verify(messagingTemplate).convertAndSendToUser(
                eq(firstUserId.toString()),
                eq("/queue/notifications"),
                any(RealtimeNotificationPayload.class)
        );
        verify(messagingTemplate).convertAndSendToUser(
                eq(secondUserId.toString()),
                eq("/queue/notifications"),
                any(RealtimeNotificationPayload.class)
        );
    }

    @Test
    void sendSubjectNotificationDoesNothingWhenNoFavoriteUsers() {
        when(favoriteRepository.findUserIdsBySubjectId(7L)).thenReturn(List.of());

        notificationService.sendSubjectNotification(7L, "Math", 99L);

        verify(historyRepository, never()).save(any());
        verify(notificationRepository, never()).saveAll(any());
        verify(messagingTemplate, never()).convertAndSendToUser(any(), any(), any());
    }
}
