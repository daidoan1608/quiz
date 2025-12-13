package com.fita.vnua.quiz.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CampaignResponse {
    private Long id;
    private String title;
    private String message;
    private String sendType;
    private LocalDateTime createdAt;
    private UUID createdBy;
}