package com.fita.vnua.quiz.model.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserAnswerDto {
    private Long userAnswerId;
    private Long userExamId;
    private Long questionId;
    private Long answerId;
}
