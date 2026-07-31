package com.fita.vnua.quiz.service;

public interface OtpService {
    void generateOtp(String email);

    String verifyOtp(String email, String otp);

    void resetPassword(String resetToken, String newPassword);
}
