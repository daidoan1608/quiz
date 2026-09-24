package com.fita.vnua.quiz.model.dto.ai;

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
public class GenerateQuestionsResponse {
    private int totalGenerated;
    private int totalSaved;
    private Long chapterId;
    private String fileName;
    private String provider;
    @Builder.Default
    private List<GeneratedQuestionDto> questions = new ArrayList<>();
}
