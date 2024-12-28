package com.fita.vnua.quiz.model.dto.request;


import lombok.Data;

@Data
public class LogoutRequest {
    private String refreshToken;
}