package com.fita.vnua.quiz.model.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String email;
    private String avatarUrl;
    private String phone;
    private String address;
}
