package com.fita.vnua.quiz.model.dto.ai;

import com.fita.vnua.quiz.model.enums.QuestionDifficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedQuestionDto {
    private String content;
    private QuestionDifficulty difficulty;
    private String explanation;
    @Builder.Default
    private List<GeneratedAnswerDto> answers = new ArrayList<>();
    private Long savedQuestionId;
}
