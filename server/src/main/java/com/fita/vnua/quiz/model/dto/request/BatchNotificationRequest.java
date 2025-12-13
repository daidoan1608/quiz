package com.fita.vnua.quiz.model.dto.request;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BatchNotificationRequest {
    private List<UUID> userIds; // Danh sách người nhận
    private String title;
    private String message;
}