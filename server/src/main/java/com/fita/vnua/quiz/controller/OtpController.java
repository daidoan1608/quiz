package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.request.ForgotPasswordRequest;
import com.fita.vnua.quiz.model.dto.request.TokenAndNewPasswordRequest;
import com.fita.vnua.quiz.model.dto.request.VerifyOtpRequest;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/otp")
@RequiredArgsConstructor
public class OtpController {
    private final OtpService otpService;

    // Gửi OTP để thay đổi mật khẩu
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<String>> sendOtp(@RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        try {
            String otp = otpService.generateOtp(forgotPasswordRequest.getEmail());
            return ResponseEntity.ok(ApiResponse.success("OTP sent successfully", otp));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to send OTP", List.of(e.getMessage())));
        }
    }

    // Xác thực OTP để thay đổi mật khẩu
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@RequestBody VerifyOtpRequest verifyOtpRequest) {
        try {
            String verificationResult = otpService.verifyOtp(verifyOtpRequest.getEmail(), verifyOtpRequest.getOtp());
            return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", verificationResult));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error("Failed to verify OTP", List.of(e.getMessage())));
        }
    }

    // Đặt lại mật khẩu
    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody TokenAndNewPasswordRequest tokenAndNewPasswordRequest) {
        try {
            String resetResult = otpService.resetPassword(tokenAndNewPasswordRequest.getResetToken(), tokenAndNewPasswordRequest.getNewPassword());
            return ResponseEntity.ok(ApiResponse.success("Password reset successfully", resetResult));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to reset password", List.of(e.getMessage())));
        }
    }
}
