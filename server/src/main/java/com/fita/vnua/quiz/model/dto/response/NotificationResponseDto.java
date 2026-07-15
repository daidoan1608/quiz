package com.fita.vnua.quiz.model.dto.response;

import com.fita.vnua.quiz.model.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class NotificationResponseDto implements NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private Notification.NotificationType type;
    private Long relatedId;
    private String relatedType;
    private Long isReadRaw;
    private LocalDateTime createdAt;

    @Override
    public String getType() {
        return type != null ? type.name() : null;
    }
}
