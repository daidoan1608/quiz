package com.fita.vnua.quiz.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GlobalNotificationRequest {
    @NotBlank(message = "Tiêu đề thông báo không được để trống")
    @Size(max = 255, message = "Tiêu đề thông báo không được vượt quá 255 ký tự")
    private String title;
    @NotBlank(message = "Nội dung thông báo không được để trống")
    @Size(max = 5000, message = "Nội dung thông báo không được vượt quá 5000 ký tự")
    private String message;
}
