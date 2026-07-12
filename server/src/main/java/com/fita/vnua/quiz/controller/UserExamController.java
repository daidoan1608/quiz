package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.UserExamDto;
import com.fita.vnua.quiz.model.dto.UserExamSummaryDto;
import com.fita.vnua.quiz.model.dto.request.SaveExamAttemptAnswerRequest;
import com.fita.vnua.quiz.model.dto.request.StartExamAttemptRequest;
import com.fita.vnua.quiz.model.dto.request.UpdateExamAttemptProgressRequest;
import com.fita.vnua.quiz.model.dto.request.UserExamRequest;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.dto.response.ExamAttemptResponse;
import com.fita.vnua.quiz.model.dto.response.UserExamResponse;
import com.fita.vnua.quiz.service.UserExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
@Tag(name = "User Exam API", description = "API cho các chức năng liên quan đến bài thi của người dùng")
public class UserExamController {
    private final UserExamService userExamService;

    @GetMapping("public/user-exam-summaries")
    @Operation(summary = "Thống kê điểm thi của người dùng")
    public ResponseEntity<ApiResponse<List<UserExamSummaryDto>>> getUserExamSummaries(
            @RequestParam(defaultValue = "all") String period) {
        LocalDate today = LocalDate.now();
        LocalDateTime fromDate = switch (period == null ? "all" : period.toLowerCase()) {
            case "week" -> today.with(DayOfWeek.MONDAY).atStartOfDay();
            case "month" -> today.withDayOfMonth(1).atStartOfDay();
            default -> null;
        };
        LocalDateTime toDate = switch (period == null ? "all" : period.toLowerCase()) {
            case "week" -> today.with(DayOfWeek.MONDAY).plusWeeks(1).atStartOfDay();
            case "month" -> today.withDayOfMonth(1).plusMonths(1).atStartOfDay();
            default -> null;
        };
        List<UserExamSummaryDto> summaries = userExamService.getUserExamSummaries(fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Summaries fetched successfully", summaries));
    }

    @GetMapping("admin/user-exams")
    @Operation(summary = "Lấy danh sách bài thi của tất cả người dùng")
    public ResponseEntity<ApiResponse<List<UserExamResponse>>> getAllUserExams() {
        List<UserExamResponse> userExams = userExamService.getAllUserExams();
        return ResponseEntity.ok(ApiResponse.success("User exams fetched successfully", userExams));
    }

    @GetMapping("user-exams")
    @Operation(summary = "Lấy bài thi của người dùng theo userId và subjectId")
    public ResponseEntity<ApiResponse<List<UserExamResponse>>> getUserExamByUserIdAndSubjectId(
            @Parameter(description = "User ID", required = true) @RequestParam("userId") UUID userId,
            @Parameter(description = "Subject ID", required = true) @RequestParam("subjectId") Long subjectId
    ) {
        List<UserExamResponse> userExams = userExamService.getExamsByUserAndSubject(userId, subjectId);
        return ResponseEntity.ok(ApiResponse.success("User exams fetched successfully", userExams));
    }

    @GetMapping("users/{userId}/user-exams/recent")
    @Operation(summary = "Lấy 7 bài thi gần nhất của người dùng theo userId")
    public ResponseEntity<ApiResponse<List<UserExamResponse>>> getLast7UserExamsByUserId(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId
    ) {
        List<UserExamResponse> userExams = userExamService.getLast7ExamsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User exams fetched successfully", userExams));
    }

    @GetMapping("user-exams/{userExamId}")
    @Operation(summary = "Lấy bài thi của người dùng theo ID")
    public ResponseEntity<ApiResponse<UserExamResponse>> getUserExamById(@PathVariable("userExamId") Long userExamId) {
        UserExamResponse userExam = userExamService.getUserExamById(userExamId);
        return ResponseEntity.ok(ApiResponse.success("User exam fetched successfully", userExam));
    }

    @GetMapping("users/{userId}/user-exams/count")
    @Operation(summary = "Lấy số lượng bài thi của người dùng theo userId")
    public ResponseEntity<ApiResponse<List<Map<Long, Object>>>> getExamAttemptsByUserId(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId
    ) {
        List<Map<Long, Object>> attempts = userExamService.getExamAttemptsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Exam attempts fetched successfully", attempts));
    }

    @PostMapping("user-exams")
    @Operation(summary = "Tạo bài thi cho người dùng")
    public ResponseEntity<ApiResponse<UserExamDto>> createUserExam(@RequestBody UserExamRequest userExamRequest) {
        UserExamDto saveUserExam = userExamService.createUserExam(userExamRequest);
        return ResponseEntity.ok(ApiResponse.success("User exam created successfully", saveUserExam));
    }

    @PostMapping("exam-attempts/start")
    @Operation(summary = "Tạo mới hoặc resume bài thi đang thực hiện")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> startOrResumeAttempt(@RequestBody StartExamAttemptRequest request) {
        ExamAttemptResponse attempt = userExamService.startOrResumeAttempt(request);
        return ResponseEntity.ok(ApiResponse.success("Exam attempt started/resumed successfully", attempt));
    }

    @GetMapping("users/{userId}/exam-attempts/in-progress")
    @Operation(summary = "Lấy danh sách bài thi đang thực hiện của người dùng")
    public ResponseEntity<ApiResponse<List<ExamAttemptResponse>>> getInProgressAttempts(@PathVariable("userId") UUID userId) {
        List<ExamAttemptResponse> attempts = userExamService.getInProgressAttempts(userId);
        return ResponseEntity.ok(ApiResponse.success("In-progress attempts fetched successfully", attempts));
    }

    @PutMapping("exam-attempts/{userExamId}/answers")
    @Operation(summary = "Autosave đáp án của bài thi đang thực hiện")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> saveAttemptAnswer(
            @PathVariable("userExamId") Long userExamId,
            @RequestBody SaveExamAttemptAnswerRequest request) {
        ExamAttemptResponse attempt = userExamService.saveAttemptAnswer(userExamId, request);
        return ResponseEntity.ok(ApiResponse.success("Attempt answer saved successfully", attempt));
    }

    @PatchMapping("exam-attempts/{userExamId}/progress")
    @Operation(summary = "Cập nhật câu hiện tại/thời gian còn lại của bài thi đang thực hiện")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> updateAttemptProgress(
            @PathVariable("userExamId") Long userExamId,
            @RequestBody UpdateExamAttemptProgressRequest request) {
        ExamAttemptResponse attempt = userExamService.updateAttemptProgress(userExamId, request);
        return ResponseEntity.ok(ApiResponse.success("Attempt progress updated successfully", attempt));
    }

    @PostMapping("exam-attempts/{userExamId}/submit")
    @Operation(summary = "Nộp bài thi đang thực hiện")
    public ResponseEntity<ApiResponse<UserExamDto>> submitAttempt(@PathVariable("userExamId") Long userExamId) {
        UserExamDto userExam = userExamService.submitAttempt(userExamId);
        return ResponseEntity.ok(ApiResponse.success("Exam attempt submitted successfully", userExam));
    }

    @GetMapping("users/{userId}/user-exams")
    @Operation(summary = "Lấy bài thi của người dùng theo userId")
    public ResponseEntity<ApiResponse<List<UserExamResponse>>> getUserExamByUserId(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId
    ) {
        List<UserExamResponse> userExam = userExamService.getUserExamByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("User exam fetched successfully", userExam));
    }
}
