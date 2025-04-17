package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.request.ForgotPasswordRequest;
import com.fita.vnua.quiz.model.dto.request.TokenAndNewPasswordRequest;
import com.fita.vnua.quiz.model.dto.request.VerifyOtpRequest;
import com.fita.vnua.quiz.service.impl.OtpServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/otp")
@RequiredArgsConstructor
public class OtpController {
    private final OtpServiceImpl otpService;

    @PostMapping("/send")
    public ResponseEntity<String> sendOtp(@RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        return ResponseEntity.ok(otpService.generateOtp(forgotPasswordRequest.getEmail()));
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtpRequest verifyOtpRequest) {
        return ResponseEntity.ok(otpService.verifyOtp(verifyOtpRequest.getEmail(), verifyOtpRequest.getOtp()));
    }

    @PostMapping("/reset")
    public ResponseEntity<String> resetPassword(@RequestBody TokenAndNewPasswordRequest tokenAndNewPasswordRequest) {
        return ResponseEntity.ok(otpService.resetPassword(tokenAndNewPasswordRequest.getResetToken(), tokenAndNewPasswordRequest.getNewPassword()));
    }
}
