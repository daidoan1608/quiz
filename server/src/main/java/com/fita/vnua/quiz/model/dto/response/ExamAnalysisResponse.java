package com.fita.vnua.quiz.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamAnalysisResponse {
    private Long userExamId;
    private String performanceTier; // XUẤT SẮC, GIỎI, KHÁ, TRUNG BÌNH, CẦN CỐ GẮNG
    private String summary;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> recommendations;
    private boolean cached;
    private String provider;
}
