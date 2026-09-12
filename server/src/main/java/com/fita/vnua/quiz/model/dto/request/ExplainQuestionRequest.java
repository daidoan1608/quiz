package com.fita.vnua.quiz.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExplainQuestionRequest {
    @NotNull(message = "questionId không được để trống")
    private Long questionId;

    private List<Long> selectedAnswerIds;
}
