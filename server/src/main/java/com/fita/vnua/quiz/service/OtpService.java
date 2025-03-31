package com.fita.vnua.quiz.service;

public interface OtpService {
    String generateOtp(String email);

    boolean verifyOtp(String email, String otp);

}
