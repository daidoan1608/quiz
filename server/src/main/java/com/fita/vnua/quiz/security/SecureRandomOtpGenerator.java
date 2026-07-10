package com.fita.vnua.quiz.security;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class SecureRandomOtpGenerator implements OtpGenerator {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Override
    public String generateNumericOtp(int length) {
        if (length <= 0) {
            throw new IllegalArgumentException("OTP length must be positive");
        }

        StringBuilder otp = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            otp.append(SECURE_RANDOM.nextInt(10));
        }
        return otp.toString();
    }
}
