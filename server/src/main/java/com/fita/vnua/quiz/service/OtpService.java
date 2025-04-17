package com.fita.vnua.quiz.service;

public interface OtpService {
    String generateOtp(String email);

    String verifyOtp(String email, String otp);

}
