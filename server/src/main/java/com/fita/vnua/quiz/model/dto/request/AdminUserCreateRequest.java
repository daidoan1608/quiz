package com.fita.vnua.quiz.model.dto.request;

import com.fita.vnua.quiz.model.entity.User;
import lombok.Data;

@Data
public class AdminUserCreateRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private User.Role role = User.Role.USER;
    private String avatarUrl;
    private String phone;
    private String address;
}
