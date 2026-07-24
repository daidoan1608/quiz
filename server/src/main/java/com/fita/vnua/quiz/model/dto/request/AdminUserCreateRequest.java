package com.fita.vnua.quiz.model.dto.request;

import com.fita.vnua.quiz.model.enums.UserRole;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class AdminUserCreateRequest extends UpdateProfileRequest {
    private String username;
    private String password;
    private UserRole role = UserRole.USER;
}
