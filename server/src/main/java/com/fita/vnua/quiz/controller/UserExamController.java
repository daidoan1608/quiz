package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.UserExamDto;
import com.fita.vnua.quiz.model.dto.UserExamSummaryDto;
import com.fita.vnua.quiz.model.dto.request.SaveExamAttemptAnswerRequest;
import com.fita.vnua.quiz.model.dto.request.StartExamAttemptRequest;
import com.fita.vnua.quiz.model.dto.request.UpdateExamAttemptProgressRequest;
import com.fita.vnua.quiz.model.dto.request.UserExamRequest;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.dto.response.ExamAttemptResponse;
import com.fita.vnua.quiz.model.dto.response.RankingResponse;
import com.fita.vnua.quiz.model.dto.response.UserExamResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.service.AuthorizationService;
import com.fita.vnua.quiz.service.UserExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final AuthorizationService authorizationService;

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
        return ResponseEntity.ok(ApiResponse.success("Lấy thống kê điểm thi thành công", summaries));
    }

    @GetMapping("public/rankings")
    @Operation(summary = "Lấy bảng xếp hạng tối ưu")
    public ResponseEntity<ApiResponse<RankingResponse>> getRankings(
            @RequestParam(defaultValue = "all") String period,
            @RequestParam(required = false) String subjectName,
            @RequestParam(defaultValue = "total") String criteria,
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal User currentUser) {
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
        RankingResponse rankings = userExamService.getRankings(
                fromDate,
                toDate,
                subjectName,
                criteria,
                limit,
                currentUser == null ? null : currentUser.getUserId()
        );
        return ResponseEntity.ok(ApiResponse.success("Lấy bảng xếp hạng thành công", rankings));
    }

    @GetMapping("admin/user-exams")
    @Operation(summary = "Lấy danh sách bài thi của tất cả người dùng")
    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'USER_EXAM', 'VIEW', 'GLOBAL', null) or (#subjectId != null and @adminCapabilityService.hasPermission(principal, 'USER_EXAM', 'VIEW', 'SUBJECT', #subjectId))")
    public ResponseEntity<Page<UserExamResponse>> getAllUserExams(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startedFrom,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startedTo,
            @PageableDefault(sort = "startTime", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(userExamService.getAllUserExamsForAdmin(
                keyword,
                categoryId,
                subjectId,
                startedFrom,
                startedTo,
                pageable
        ));
    }

    @GetMapping("user-exams")
    @Operation(summary = "Lấy bài thi của người dùng theo userId và subjectId")
    public ResponseEntity<ApiResponse<List<UserExamResponse>>> getUserExamByUserIdAndSubjectId(
            @Parameter(description = "User ID", required = true) @RequestParam("userId") UUID userId,
            @Parameter(description = "Subject ID", required = true) @RequestParam("subjectId") Long subjectId,
            @AuthenticationPrincipal User currentUser
    ) {
        authorizationService.requireSelfOrAdminMod(userId, currentUser);
        List<UserExamResponse> userExams = userExamService.getExamsByUserAndSubject(userId, subjectId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài thi theo người dùng và môn học thành công", userExams));
    }

    @GetMapping("users/{userId}/user-exams/recent")
    @Operation(summary = "Lấy 7 bài thi gần nhất của người dùng theo userId")
    public ResponseEntity<ApiResponse<List<UserExamResponse>>> getLast7UserExamsByUserId(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId,
            @AuthenticationPrincipal User currentUser
    ) {
        authorizationService.requireSelfOrAdminMod(userId, currentUser);
        List<UserExamResponse> userExams = userExamService.getLast7ExamsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài thi gần nhất thành công", userExams));
    }

    @GetMapping("user-exams/{userExamId}")
    @Operation(summary = "Lấy bài thi của người dùng theo ID")
    public ResponseEntity<ApiResponse<UserExamResponse>> getUserExamById(
            @PathVariable("userExamId") Long userExamId,
            @AuthenticationPrincipal User currentUser) {
        User authenticatedUser = authorizationService.requireAuthenticated(currentUser);
        UserExamResponse userExam = authorizationService.isAdminOrMod(authenticatedUser)
                ? userExamService.getUserExamByIdForAdmin(userExamId)
                : userExamService.getUserExamByIdForUser(userExamId, authenticatedUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin bài thi của người dùng thành công", userExam));
    }

    @GetMapping("users/{userId}/user-exams/count")
    @Operation(summary = "Lấy số lượng bài thi của người dùng theo userId")
    public ResponseEntity<ApiResponse<List<Map<Long, Object>>>> getExamAttemptsByUserId(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId,
            @AuthenticationPrincipal User currentUser
    ) {
        authorizationService.requireSelfOrAdminMod(userId, currentUser);
        List<Map<Long, Object>> attempts = userExamService.getExamAttemptsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy số lượt làm bài thành công", attempts));
    }

    @PostMapping("user-exams")
    @Operation(summary = "Tạo bài thi cho người dùng")
    public ResponseEntity<ApiResponse<UserExamDto>> createUserExam(
            @RequestBody UserExamRequest userExamRequest,
            @AuthenticationPrincipal User currentUser
    ) {
        authorizationService.requireAuthenticated(currentUser);
        UserExamDto saveUserExam = userExamService.createUserExam(userExamRequest, currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Tạo bài thi cho người dùng thành công", saveUserExam));
    }

    @PostMapping("exam-attempts/start")
    @Operation(summary = "Tạo mới hoặc resume bài thi đang thực hiện")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> startOrResumeAttempt(
            @RequestBody StartExamAttemptRequest request,
            @AuthenticationPrincipal User currentUser) {
        authorizationService.requireAuthenticated(currentUser);
        ExamAttemptResponse attempt = userExamService.startOrResumeAttempt(request, currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Bắt đầu hoặc tiếp tục bài thi thành công", attempt));
    }

    @GetMapping("users/{userId}/exam-attempts/in-progress")
    @Operation(summary = "Lấy danh sách bài thi đang thực hiện của người dùng")
    public ResponseEntity<ApiResponse<List<ExamAttemptResponse>>> getInProgressAttempts(
            @PathVariable("userId") UUID userId,
            @AuthenticationPrincipal User currentUser) {
        authorizationService.requireSelfOrAdminMod(userId, currentUser);
        List<ExamAttemptResponse> attempts = userExamService.getInProgressAttempts(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài thi đang làm thành công", attempts));
    }

    @PutMapping("exam-attempts/{userExamId}/answers")
    @Operation(summary = "Autosave đáp án của bài thi đang thực hiện")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> saveAttemptAnswer(
            @PathVariable("userExamId") Long userExamId,
            @RequestBody SaveExamAttemptAnswerRequest request,
            @AuthenticationPrincipal User currentUser) {
        authorizationService.requireAuthenticated(currentUser);
        ExamAttemptResponse attempt = userExamService.saveAttemptAnswer(userExamId, request, currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Lưu đáp án thành công", attempt));
    }

    @PatchMapping("exam-attempts/{userExamId}/progress")
    @Operation(summary = "Cập nhật câu hiện tại/thời gian còn lại của bài thi đang thực hiện")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> updateAttemptProgress(
            @PathVariable("userExamId") Long userExamId,
            @RequestBody UpdateExamAttemptProgressRequest request,
            @AuthenticationPrincipal User currentUser) {
        authorizationService.requireAuthenticated(currentUser);
        ExamAttemptResponse attempt = userExamService.updateAttemptProgress(userExamId, request, currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tiến độ làm bài thành công", attempt));
    }

    @PostMapping("exam-attempts/{userExamId}/submit")
    @Operation(summary = "Nộp bài thi đang thực hiện")
    public ResponseEntity<ApiResponse<UserExamDto>> submitAttempt(
            @PathVariable("userExamId") Long userExamId,
            @AuthenticationPrincipal User currentUser) {
        authorizationService.requireAuthenticated(currentUser);
        UserExamDto userExam = userExamService.submitAttempt(userExamId, currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Nộp bài thi thành công", userExam));
    }

    @GetMapping("users/{userId}/user-exams")
    @Operation(summary = "Lấy bài thi của người dùng theo userId")
    public ResponseEntity<ApiResponse<List<UserExamResponse>>> getUserExamByUserId(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId,
            @AuthenticationPrincipal User currentUser
    ) {
        authorizationService.requireSelfOrAdminMod(userId, currentUser);
        List<UserExamResponse> userExam = userExamService.getUserExamByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài thi của người dùng thành công", userExam));
    }
}
