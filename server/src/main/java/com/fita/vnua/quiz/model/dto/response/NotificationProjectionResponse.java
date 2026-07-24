package com.fita.vnua.quiz.model.dto.response;

import com.fita.vnua.quiz.model.enums.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class NotificationProjectionResponse implements NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private Long relatedId;
    private String relatedType;
    private Long isReadRaw;
    private LocalDateTime createdAt;

    @Override
    public String getType() {
        return type != null ? type.name() : null;
    }
}
