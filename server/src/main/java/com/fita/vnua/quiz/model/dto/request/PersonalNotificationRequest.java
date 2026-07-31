package com.fita.vnua.quiz.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
public class PersonalNotificationRequest extends GlobalNotificationRequest {
    @NotNull(message = "Người nhận không được để trống")
    private UUID userId; // Quan trọng: Dùng UUID
}
