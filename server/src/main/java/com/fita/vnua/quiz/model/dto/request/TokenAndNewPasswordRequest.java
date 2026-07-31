package com.fita.vnua.quiz.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TokenAndNewPasswordRequest {
    @NotBlank(message = "Token đặt lại mật khẩu không được để trống")
    String resetToken;
    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 8, max = 72, message = "Mật khẩu mới phải có từ 8 đến 72 ký tự")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "Mật khẩu mới phải có cả chữ và số")
    String newPassword;
}
