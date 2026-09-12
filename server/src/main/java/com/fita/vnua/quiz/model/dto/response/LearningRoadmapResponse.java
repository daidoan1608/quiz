package com.fita.vnua.quiz.model.dto.response;

import com.fita.vnua.quiz.model.dto.ai.RoadmapStepDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningRoadmapResponse {
    private String summary;
    private List<RoadmapStepDto> steps;
    private boolean cached;
    private String provider;
}
