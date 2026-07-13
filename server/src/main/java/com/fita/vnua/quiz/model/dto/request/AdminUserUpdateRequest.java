package com.fita.vnua.quiz.model.dto.request;

import com.fita.vnua.quiz.model.entity.User;
import lombok.Data;

@Data
public class AdminUserUpdateRequest {
    private String fullName;
    private String email;
    private User.Role role;
    private String avatarUrl;
    private String phone;
    private String address;
    private String password;
}
