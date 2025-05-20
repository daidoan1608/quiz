package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name="Statistics API", description = "API cho các chức năng thống kê")
public class StatisticsController {
    private final StatisticsService statisticsService;

    @GetMapping("/api/v1/admin/statistics")
    @Operation(summary = "Lấy thống kê tổng quan")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics() {
        try {
            Map<String, Object> statistics = statisticsService.getStatistics();
            return ResponseEntity.ok(ApiResponse.success("Statistics fetched successfully", statistics));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch statistics", List.of(e.getMessage())));
        }
    }
}
