package com.fita.vnua.quiz.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SharedDocumentResponse {
    private Long id;
    private String title;
    private String description;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String downloadUrl;
}
