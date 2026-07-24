package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.service.AvatarStorageService;
import com.fita.vnua.quiz.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Avatar API", description = "API thao tác thêm sửa xoá avatar")
public class AvatarController {
    private final AvatarStorageService storage;
    private final UserService userService;

    @Operation(summary = "API thay/thêm avatar")
    @PutMapping("/avatar")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAvatar(
            @AuthenticationPrincipal User currentUser,
            @RequestParam("file") MultipartFile file) throws Exception {
        UUID userId = currentUser.getUserId();
        log.debug("Uploading avatar for userId={}, file={}", userId, file.getOriginalFilename());

        String oldUrl = userService.getUserResponseById(userId).getAvatarUrl();

        var up = storage.saveAvatar(userId, file, oldUrl);

        userService.updateAvatar(userId, up.getUrl());

        return ResponseEntity.ok(ApiResponse.success(
                "Cập nhật avatar thành công",
                Map.of("avatarUrl", up.getUrl(), "imgPath", up.getFilename())
        ));
    }

    @Operation(summary = "API lấy link avatar")
    @GetMapping("/avatar")
    public ResponseEntity<ApiResponse<Map<String, String>>> getAvatar(@AuthenticationPrincipal User currentUser) {
        String url = userService.getUserResponseById(currentUser.getUserId()).getAvatarUrl();
        if (url == null || url.isBlank()) {
            url = storage.getDefaultUrl();
        }
        return ResponseEntity.ok(ApiResponse.success("Lấy avatar thành công", Map.of("avatarUrl", url)));
    }
}
