package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.service.UserService;
import com.fita.vnua.quiz.service.impl.AvatarStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
@Tag(name = "Avatar API", description = "API thao tác thêm sửa xoá avatar")
public class AvatarController {
    private final AvatarStorageService storage;
    private final UserService userService;

    @Operation(summary = "API thay/thêm avatar")
    @PostMapping("/avatar/{userId}")
    public Map<String, String> uploadAvatar(
            @PathVariable("userId") UUID userId,
            @RequestParam("file") MultipartFile file) throws Exception {
        System.out.println("=== Upload avatar ===");
        System.out.println("userId = " + userId);
        System.out.println("file = " + file.getOriginalFilename());

            String oldUrl = userService.getUserById(userId).getAvatarUrl();

            var up = storage.saveAvatar(userId, file, oldUrl);

            userService.updateAvatar(userId, up.getUrl());

            return Map.of("avatarUrl", up.getUrl(), "imgPath", up.getFilename());


    }
    @Operation(summary = "API lấy link avatar")
    @GetMapping("/avatar")
    public Map<String, String> getAvatar(@RequestParam("userId") UUID userId) {
        String url = userService.getUserById(userId).getAvatarUrl();
        if (url == null || url.isBlank()) {
            url = storage.getDefaultUrl();
        }
        return Map.of("avatarUrl", url);
    }
}
