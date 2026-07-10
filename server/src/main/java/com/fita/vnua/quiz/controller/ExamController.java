package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.ExamDto;
import com.fita.vnua.quiz.model.dto.ExamSummaryDto;
import com.fita.vnua.quiz.model.dto.request.ExamRequest;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
@Tag(name = "Exam API", description = "API cho các chức năng liên quan đến bài thi")
public class ExamController {
    private final ExamService examService;

    @PostMapping("admin/exams")
    @Operation(summary = "Tạo bài thi")
    public ResponseEntity<ApiResponse<ExamDto>> createExam(@RequestBody ExamRequest examRequest) {
        ExamDto createdExam = examService.createExam(examRequest);
        return ResponseEntity.ok(ApiResponse.success("Exam created successfully", createdExam));
    }

    @GetMapping("admin/exams")
    @Operation(summary = "Lấy danh sách bài thi")
    public ResponseEntity<ApiResponse<List<ExamSummaryDto>>> getAllExams() {
        List<ExamSummaryDto> exams = examService.getAllExams();
        return ResponseEntity.ok(ApiResponse.success("All exams fetched successfully", exams));
    }

    @GetMapping("public/exams/subject/{subjectId}")
    @Operation(summary = "Lấy danh sách bài thi theo Id môn (public)")
    public ResponseEntity<ApiResponse<List<ExamSummaryDto>>> getExamsBySubjectId(@PathVariable("subjectId") Long subjectId) {
        List<ExamSummaryDto> exams = examService.getExamsBySubjectId(subjectId);
        return ResponseEntity.ok(ApiResponse.success("Exams fetched successfully", exams));
    }

    @GetMapping("public/exams/{examId}")
    @Operation(summary = "Lấy bài thi theo Id bài thi(public)")
    public ResponseEntity<ApiResponse<ExamDto>> getExamById(@PathVariable("examId") Long examId) {
        ExamDto exam = examService.getExamById(examId);
        return ResponseEntity.ok(ApiResponse.success("Exam fetched successfully", exam));
    }

    @PutMapping("admin/exams/{examId}")
    @Operation(summary = "Cập nhật bài thi")
    public ResponseEntity<ApiResponse<ExamDto>> updateExam(@PathVariable("examId") Long examId, @RequestBody ExamDto examDto) {
        ExamDto updatedExam = examService.updateExam(examId, examDto);
        return ResponseEntity.ok(ApiResponse.success("Exam updated successfully", updatedExam));
    }

    @DeleteMapping("admin/exams/{examId}")
    @Operation(summary = "Xóa bài thi")
    public ResponseEntity<Void> deleteExam(@PathVariable("examId") Long examId) {
        examService.deleteExam(examId);
        return ResponseEntity.noContent().build();
    }
}
