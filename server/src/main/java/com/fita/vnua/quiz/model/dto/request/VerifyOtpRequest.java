package com.fita.vnua.quiz.model.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VerifyOtpRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    String email;
    @NotBlank(message = "OTP không được để trống")
    @Pattern(regexp = "^[0-9]{4,8}$", message = "OTP không hợp lệ")
    String otp;
}
