package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.request.ForgotPasswordRequest;
import com.fita.vnua.quiz.model.dto.request.TokenAndNewPasswordRequest;
import com.fita.vnua.quiz.model.dto.request.VerifyOtpRequest;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/otp")
@Tag(name="OTP API", description = "API cho các chức năng liên quan đến mã OTP")
@RequiredArgsConstructor
public class OtpController {
    private final OtpService otpService;

    @PostMapping("/send")
    @Operation(summary = "Gửi mã OTP đến email")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        otpService.generateOtp(forgotPasswordRequest.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Mã OTP đã được gửi đến email.", null));
    }


    @PostMapping("/verify")
    @Operation(summary = "Xác thực mã OTP")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@Valid @RequestBody VerifyOtpRequest verifyOtpRequest) {
        String resetToken = otpService.verifyOtp(verifyOtpRequest.getEmail(), verifyOtpRequest.getOtp());
        return ResponseEntity.ok(ApiResponse.success("Xác thực OTP thành công", resetToken));
    }


    // Đặt lại mật khẩu
    @PostMapping("/reset")
    @Operation(summary = "Đặt lại mật khẩu")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody TokenAndNewPasswordRequest tokenAndNewPasswordRequest) {
        otpService.resetPassword(tokenAndNewPasswordRequest.getResetToken(), tokenAndNewPasswordRequest.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công.", null));
    }

}
