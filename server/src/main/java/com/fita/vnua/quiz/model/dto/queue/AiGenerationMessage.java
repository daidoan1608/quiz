package com.fita.vnua.quiz.model.dto.queue;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiGenerationMessage implements Serializable {
    private static final long serialVersionUID = 1L;

    private String jobId;
    private UUID userId;
    private Long chapterId;
    private String originalFileName;
    private String difficulty;
    private Integer numberOfQuestions;
    private Boolean saveToDatabase;
    private String extractedText;
    private LocalDateTime requestedAt;
}
