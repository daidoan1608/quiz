package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.FavoriteDto;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.service.AuthorizationService;
import com.fita.vnua.quiz.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Favorite API", description = "API cho các chức năng liên quan đến môn học yêu thích")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final AuthorizationService authorizationService;

    @PostMapping("/favorites")
    @Operation(summary = "Thêm môn học yêu thích")
    public ResponseEntity<ApiResponse<FavoriteDto>> createFavorite(
            @RequestBody FavoriteDto favoriteDto,
            @AuthenticationPrincipal User currentUser
    ) {
        User authenticatedUser = authorizationService.requireAuthenticated(currentUser);
        FavoriteDto created = favoriteService.create(favoriteDto, authenticatedUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Thêm favorite thành công", created));
    }

    @DeleteMapping("/favorites")
    @Operation(summary = "Xóa môn học yêu thích")
    public ResponseEntity<ApiResponse<FavoriteDto>> deleteFavorite(
            @RequestBody FavoriteDto favoriteDto,
            @AuthenticationPrincipal User currentUser
    ) {
        User authenticatedUser = authorizationService.requireAuthenticated(currentUser);
        FavoriteDto deleted = favoriteService.delete(favoriteDto, authenticatedUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Xóa favorite thành công", deleted));
    }

    @GetMapping("/users/{userId}/favorites")
    @Operation(summary = "Lấy danh sách môn học yêu thích theo userId")
    public ResponseEntity<ApiResponse<List<FavoriteDto>>> getFavoritesByUserId(
            @PathVariable UUID userId,
            @AuthenticationPrincipal User currentUser
    ) {
        authorizationService.requireSelfOrAdminMod(userId, currentUser);
        List<FavoriteDto> favorites = favoriteService.findFavoriteByUserID(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách favorite thành công", favorites));
    }
}
