package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.request.ForgotPasswordRequest;
import com.fita.vnua.quiz.model.dto.request.TokenAndNewPasswordRequest;
import com.fita.vnua.quiz.model.dto.request.VerifyOtpRequest;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/otp")
@Tag(name="OTP API", description = "API cho các chức năng liên quan đến mã OTP")
@RequiredArgsConstructor
public class OtpController {
    private final OtpService otpService;

    @PostMapping("/send")
    @Operation(summary = "Gửi mã OTP đến email")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        ApiResponse<Void> response = otpService.generateOtp(forgotPasswordRequest.getEmail());
        if ("success".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }


    @PostMapping("/verify")
    @Operation(summary = "Xác thực mã OTP")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@RequestBody VerifyOtpRequest verifyOtpRequest) {
        ApiResponse<String> response = otpService.verifyOtp(verifyOtpRequest.getEmail(), verifyOtpRequest.getOtp());

        if ("success".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }


    // Đặt lại mật khẩu
    @PostMapping("/reset")
    @Operation(summary = "Đặt lại mật khẩu")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody TokenAndNewPasswordRequest tokenAndNewPasswordRequest) {
        ApiResponse<Void> response = otpService.resetPassword(tokenAndNewPasswordRequest.getResetToken(), tokenAndNewPasswordRequest.getNewPassword());

        if ("success".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

}
