package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.FavoriteDto;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user/favorites")
@RequiredArgsConstructor
@Tag(name="Favorite API", description = "API cho các chức năng liên quan đến môn học yêu thích")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping
    @Operation(summary = "Thêm môn học yêu thích")
    public ResponseEntity<ApiResponse<FavoriteDto>> createFavorite(@RequestBody FavoriteDto favoriteDto) {
        try {
            FavoriteDto created = favoriteService.create(favoriteDto);
            return ResponseEntity.ok(ApiResponse.success("Thêm favorite thành công", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Thêm favorite thất bại", List.of(e.getMessage())));
        }
    }

    @DeleteMapping
    @Operation(summary = "Xóa môn học yêu thích")
    public ResponseEntity<ApiResponse<FavoriteDto>> deleteFavorite(@RequestBody FavoriteDto favoriteDto) {
        try {
            FavoriteDto deleted = favoriteService.delete(favoriteDto);
            return ResponseEntity.ok(ApiResponse.success("Xóa favorite thành công", deleted));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Xóa favorite thất bại", List.of(e.getMessage())));
        }
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Lấy danh sách môn học yêu thích theo userId")
    public ResponseEntity<ApiResponse<List<FavoriteDto>>> getFavoritesByUserId(@PathVariable UUID userId) {
        try {
            List<FavoriteDto> favorites = favoriteService.findFavoriteByUserID(userId);
            if (favorites.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy favorite nào", List.of("User chưa có favorite nào")));
            }
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách favorite thành công", favorites));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lấy danh sách favorite thất bại", List.of(e.getMessage())));
        }
    }
}
