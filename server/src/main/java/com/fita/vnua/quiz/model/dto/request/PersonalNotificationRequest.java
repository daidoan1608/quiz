package com.fita.vnua.quiz.model.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
public class PersonalNotificationRequest extends GlobalNotificationRequest {
    private UUID userId; // Quan trọng: Dùng UUID
}
