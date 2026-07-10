package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.UserExamDto;
import com.fita.vnua.quiz.model.dto.UserExamSummaryDto;
import com.fita.vnua.quiz.model.dto.request.UserExamRequest;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.dto.response.UserExamResponse;
import com.fita.vnua.quiz.service.UserExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<ApiResponse<List<UserExamSummaryDto>>> getUserExamSummaries() {
        List<UserExamSummaryDto> summaries = userExamService.getUserExamSummaries();
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

    @GetMapping("users/{userId}/user-exams")
    @Operation(summary = "Lấy bài thi của người dùng theo userId")
    public ResponseEntity<ApiResponse<List<UserExamResponse>>> getUserExamByUserId(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId
    ) {
        List<UserExamResponse> userExam = userExamService.getUserExamByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("User exam fetched successfully", userExam));
    }
}
