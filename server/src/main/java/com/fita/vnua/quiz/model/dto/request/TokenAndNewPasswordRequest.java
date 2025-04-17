package com.fita.vnua.quiz.model.dto.request;

import lombok.Data;

@Data
public class TokenAndNewPasswordRequest {
    String resetToken;
    String newPassword;
}
