package com.fita.vnua.quiz.model.dto;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserExamDto {
    private Long userExamId;
    private UUID userId;
    private Long examId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Float score;

}
