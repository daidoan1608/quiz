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

    @GetMapping("public/summaries")
    @Operation(summary = "Thống kê điểm thi của người dùng")
    public ResponseEntity<List<UserExamSummaryDto>> getUserExamSummaries() {
        List<UserExamSummaryDto> summaries = userExamService.getUserExamSummaries();
        return ResponseEntity.ok(summaries);
    }

    @GetMapping("admin/userexams")
    @Operation(summary = "Lấy danh sách bài thi của tất cả người dùng")
    public ResponseEntity<ApiResponse<List<UserExamResponse>>> getAllUserExams() {
        try {
            List<UserExamResponse> userExams = userExamService.getAllUserExams();
            if (userExams.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("No user exams found", List.of("No user exams available")));
            }
            return ResponseEntity.ok(ApiResponse.success("User exams fetched successfully", userExams));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch user exams", List.of(e.getMessage())));
        }
    }

    @GetMapping("user/userexams/{userExamId}")
    @Operation(summary = "Lấy bài thi của người dùng theo ID")
    public ResponseEntity<ApiResponse<UserExamResponse>> getUserExamById(@PathVariable("userExamId") Long userExamId) {
        try {
            UserExamResponse userExam = userExamService.getUserExamById(userExamId);
            if (userExam == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("No user exam found", List.of("No user exam found for the given ID")));
            }
            return ResponseEntity.ok(ApiResponse.success("User exam fetched successfully", userExam));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch user exam", List.of(e.getMessage())));
        }
    }

    @GetMapping("user/userexams/count/{userId}")
    @Operation(summary = "Lấy số lượng bài thi của người dùng theo userId")
    public ResponseEntity<ApiResponse<List<Map<Long, Object>>>> getExamAttemptsByUserId(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId
    ) {
        try {
            List<Map<Long, Object>> attempts = userExamService.getExamAttemptsByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("Exam attempts fetched successfully", attempts));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch exam attempts", List.of(e.getMessage())));
        }
    }

    @PostMapping("user/userexams")
    @Operation(summary = "Tạo bài thi cho người dùng")
    public ResponseEntity<ApiResponse<UserExamDto>> createUserExam(@RequestBody UserExamRequest userExamRequest) {
        try {
            UserExamDto saveUserExam = userExamService.createUserExam(userExamRequest);
            if (saveUserExam == null) {
                return ResponseEntity.status(400).body(ApiResponse.error("User exam not created", List.of("Failed to create user exam")));
            }
            return ResponseEntity.ok(ApiResponse.success("User exam created successfully", saveUserExam));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to create user exam", List.of(e.getMessage())));
        }
    }

    @GetMapping("user/userexams/user/{userId}")
    @Operation(summary = "Lấy bài thi của người dùng theo userId")
    public ResponseEntity<ApiResponse<?>> getUserExamByUserId(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId
    ) {
        try {
            List<UserExamResponse> userExam = userExamService.getUserExamByUserId(userId);
            if (userExam == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("No user exam found", List.of("No user exam found for the given user ID")));
            }
            return ResponseEntity.ok(ApiResponse.success("User exam fetched successfully", userExam));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch user exam", List.of(e.getMessage())));
        }
    }
}
