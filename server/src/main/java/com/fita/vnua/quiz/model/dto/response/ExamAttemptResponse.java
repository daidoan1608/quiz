package com.fita.vnua.quiz.model.dto.response;

import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.UserAnswerDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamAttemptResponse {
    private Long userExamId;
    private Long examId;
    private Long subjectId;
    private String title;
    private String subjectName;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime updatedAt;
    private Integer remainingTime;
    private Integer currentQuestionIndex;
    private Integer answeredCount;
    private Integer totalQuestions;
    private Float score;
    private List<UserAnswerDto> userAnswerDtos;
    private List<QuestionDto> questions;
}
