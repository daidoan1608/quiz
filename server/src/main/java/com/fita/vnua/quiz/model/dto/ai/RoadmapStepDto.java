package com.fita.vnua.quiz.model.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapStepDto {
    private int step;
    private String title;
    private String action;
    private String priority; // HIGH, MEDIUM, LOW
    private String subjectName;
}
