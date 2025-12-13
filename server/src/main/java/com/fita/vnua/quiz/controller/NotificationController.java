package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.response.NotificationResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * API lấy danh sách thông báo của User đang đăng nhập.
     * Kết quả trả về bao gồm cả thông báo riêng và thông báo hệ thống.
     */

    /**
     * API đánh dấu một thông báo là ĐÃ ĐỌC.
     * User bấm vào thông báo nào thì gọi API này với ID của thông báo đó.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        notificationService.markAsRead(id, currentUser.getUserId());
        return ResponseEntity.ok("Đã đánh dấu đã đọc");
    }

    /**
     * API: Đánh dấu TẤT CẢ là đã đọc
     * PUT /api/notifications/read-all
     */
    @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsRead(@AuthenticationPrincipal User currentUser) {
        notificationService.markAllAsRead(currentUser.getUserId());
        return ResponseEntity.ok("Đã đánh dấu tất cả là đã đọc");
    }
}