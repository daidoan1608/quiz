package com.fita.vnua.quiz.model.dto.response;

import com.fita.vnua.quiz.model.dto.UserAnswerDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserExamDetailResponse {
    private Long userExamId;
    private UUID userId;
    private Long examId;
    private String examTitle;
    private Long subjectId;
    private String subjectName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Float score;
    private List<UserAnswerDto> userAnswers;
}
