package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.request.ExplainQuestionRequest;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.dto.response.ExplainQuestionResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.service.AiExplainService;
import com.fita.vnua.quiz.model.dto.response.LearningRoadmapResponse;
import com.fita.vnua.quiz.service.AiRoadmapService;
import com.fita.vnua.quiz.model.dto.request.AnalyzeExamResultRequest;
import com.fita.vnua.quiz.model.dto.response.ExamAnalysisResponse;
import com.fita.vnua.quiz.service.AiExamAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ai")
@Tag(name = "AI Assistant API", description = "API cho các tính năng trợ lý AI học tập")
public class AiController {

    private final AiExplainService aiExplainService;
    private final AiRoadmapService aiRoadmapService;
    private final AiExamAnalysisService aiExamAnalysisService;

    @PostMapping("/explain-question")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Yêu cầu AI giải thích chi tiết câu hỏi trắc nghiệm")
    public ResponseEntity<ApiResponse<ExplainQuestionResponse>> explainQuestion(
            @Valid @RequestBody ExplainQuestionRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        ExplainQuestionResponse response = aiExplainService.explainQuestion(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Lấy giải thích từ AI thành công", response));
    }

    @GetMapping("/roadmap")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy lộ trình học tập cá nhân hóa do AI phân tích")
    public ResponseEntity<ApiResponse<LearningRoadmapResponse>> getPersonalizedRoadmap(
            @RequestParam(defaultValue = "false") boolean refresh,
            @AuthenticationPrincipal User currentUser
    ) {
        LearningRoadmapResponse roadmap = aiRoadmapService.getPersonalizedRoadmap(currentUser, refresh);
        return ResponseEntity.ok(ApiResponse.success("Lấy lộ trình học tập thành công", roadmap));
    }

    @PostMapping("/analyze-exam-result")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Yêu cầu AI phân tích sâu kết quả bài thi theo chương và độ khó")
    public ResponseEntity<ApiResponse<ExamAnalysisResponse>> analyzeExamResult(
            @Valid @RequestBody AnalyzeExamResultRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        ExamAnalysisResponse response = aiExamAnalysisService.analyzeExamResult(request.getUserExamId(), currentUser);
        return ResponseEntity.ok(ApiResponse.success("Phân tích kết quả bài thi thành công", response));
    }
}


