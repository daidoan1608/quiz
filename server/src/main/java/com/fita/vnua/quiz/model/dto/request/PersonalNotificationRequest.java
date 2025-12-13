package com.fita.vnua.quiz.model.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class PersonalNotificationRequest {
    private UUID userId; // Quan trọng: Dùng UUID
    private String title;
    private String message;
}