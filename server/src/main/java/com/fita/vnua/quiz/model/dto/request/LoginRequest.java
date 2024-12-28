package com.fita.vnua.quiz.model.dto.request;


import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Data
@Setter
public class LoginRequest {
    private String username;
    private String password;
}