package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import org.apache.poi.ss.formula.functions.T;

public interface OtpService {
    ApiResponse<Void> generateOtp(String email);

    ApiResponse<String> verifyOtp(String email, String otp);

    ApiResponse<Void> resetPassword(String resetToken, String newPassword);
}
