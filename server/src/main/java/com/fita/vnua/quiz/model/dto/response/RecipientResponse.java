package com.fita.vnua.quiz.model.dto.response;

import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipientResponse {
    private UUID userId;
    private String fullName;
    private String email;
    private boolean isRead;
}