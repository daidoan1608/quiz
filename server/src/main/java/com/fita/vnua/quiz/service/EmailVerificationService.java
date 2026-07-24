package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.entity.User;

public interface EmailVerificationService {
    void createAndSendVerification(User user);

    void verifyEmail(String token);
}
