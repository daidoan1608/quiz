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
public class ExamSubmissionMessage implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long userExamId;
    private UUID userId;
    private LocalDateTime submittedAt;
}
