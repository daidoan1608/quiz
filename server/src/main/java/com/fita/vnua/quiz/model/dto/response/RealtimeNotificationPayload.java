package com.fita.vnua.quiz.model.dto.response;

import com.fita.vnua.quiz.model.entity.Notification;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RealtimeNotificationPayload {
    private Long id;
    private String title;
    private String message;
    private String type;
    private Long relatedId;
    private String relatedType;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public static RealtimeNotificationPayload from(Notification notification) {
        return RealtimeNotificationPayload.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType() != null ? notification.getType().name() : null)
                .relatedId(notification.getRelatedId())
                .relatedType(notification.getRelatedType())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
