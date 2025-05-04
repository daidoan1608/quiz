package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.ExamDto;
import com.fita.vnua.quiz.model.dto.request.ExamRequest;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
public class ExamController {
    private final ExamService examService;

    // Tạo kỳ thi (admin)
    @PostMapping("admin/exams")
    public ResponseEntity<ApiResponse<ExamDto>> createExam(@RequestBody ExamRequest examRequest) {
        try {
            ExamDto createdExam = examService.createExam(examRequest.getExamDto(), examRequest.getNumberOfQuestion());
            return ResponseEntity.ok(ApiResponse.success("Exam created successfully", createdExam));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to create exam", List.of(e.getMessage())));
        }
    }

    // Lấy tất cả các kỳ thi (public)
    @GetMapping("admin/exams")
    public ResponseEntity<ApiResponse<List<ExamDto>>> getAllExams() {
        try {
            List<ExamDto> exams = examService.getAllExams();
            if (exams.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("No exams found", List.of("No exams available")));
            }
            return ResponseEntity.ok(ApiResponse.success("All exams fetched successfully", exams));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch exams", List.of(e.getMessage())));
        }
    }

    // Lấy kỳ thi theo subjectId (public)
    @GetMapping("exams/{subjectId}")
    public ResponseEntity<ApiResponse<List<ExamDto>>> getExamsBySubjectId(@PathVariable("subjectId") Long subjectId) {
        try {
            List<ExamDto> exams = examService.getExamsBySubjectId(subjectId);
            if (exams.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("No exams found for this subject", List.of("No exams available for this subject")));
            }
            return ResponseEntity.ok(ApiResponse.success("Exams fetched successfully", exams));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch exams", List.of(e.getMessage())));
        }
    }

    // Lấy kỳ thi theo examId (public)
    @GetMapping("public/exams/{examId}")
    public ResponseEntity<ApiResponse<ExamDto>> getExamById(@PathVariable("examId") Long examId) {
        try {
            ExamDto exam = examService.getExamById(examId);
            if (exam == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("Exam not found", List.of("No exam found with the given ID")));
            }
            return ResponseEntity.ok(ApiResponse.success("Exam fetched successfully", exam));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch exam", List.of(e.getMessage())));
        }
    }
}
