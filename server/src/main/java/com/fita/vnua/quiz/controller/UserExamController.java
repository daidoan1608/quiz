package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.UserExamDto;
import com.fita.vnua.quiz.model.dto.request.UserExamRequest;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.dto.response.UserExamResponse;
import com.fita.vnua.quiz.service.UserExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
public class UserExamController {
    private final UserExamService userExamService;

    // Lấy bài thi của người dùng theo userExamId
    @GetMapping("/user/userexams/{userExamId}")
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

    // Lấy số lần làm bài thi của người dùng theo userId
    @GetMapping("user/userexams/count/{userId}")
    @Operation(summary = "Get exam attempts by user ID")
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

    // Tạo bài thi cho người dùng (user exam)
    @PostMapping("user/userexams")
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

    // Lấy bài thi của người dùng theo userId
    @GetMapping("user/userexams/user/{userId}")
    @Operation(summary = "Get user exam by user ID")
    public ResponseEntity<ApiResponse<UserExamResponse>> getUserExamByUserId(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId
    ) {
        try {
            UserExamResponse userExam = (UserExamResponse) userExamService.getUserExamByUserId(userId);
            if (userExam == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("No user exam found", List.of("No user exam found for the given user ID")));
            }
            return ResponseEntity.ok(ApiResponse.success("User exam fetched successfully", userExam));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch user exam", List.of(e.getMessage())));
        }
    }
}
