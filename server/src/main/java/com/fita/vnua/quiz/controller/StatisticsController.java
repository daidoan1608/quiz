package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Statistics API", description = "API cho các chức năng thống kê")
public class StatisticsController {
    private final StatisticsService statisticsService;

    @GetMapping("/api/v1/admin/statistics")
    @Operation(summary = "Lấy thống kê tổng quan")
    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'STATISTIC', 'VIEW', 'GLOBAL', null)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics(
            @RequestParam(defaultValue = "5") int hotSubjectsLimit,
            @RequestParam(defaultValue = "5") int wrongQuestionsLimit,
            @RequestParam(defaultValue = "5") int activeUsersLimit,
            @RequestParam(defaultValue = "14") int attemptsDays,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long examId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startedFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startedTo,
            @RequestParam(defaultValue = "5") int examPerformanceLimit,
            @RequestParam(defaultValue = "5") int subjectPerformanceLimit,
            @RequestParam(defaultValue = "5") int rankingLimit) {
        Map<String, Object> statistics = statisticsService.getStatistics(
                hotSubjectsLimit,
                wrongQuestionsLimit,
                activeUsersLimit,
                attemptsDays,
                subjectId,
                examId,
                startedFrom,
                startedTo,
                examPerformanceLimit,
                subjectPerformanceLimit,
                rankingLimit);
        return ResponseEntity.ok(ApiResponse.success("Lấy thống kê thành công", statistics));
    }
}
