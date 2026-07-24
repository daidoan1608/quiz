package com.fita.vnua.quiz.model.dto.request;

import com.fita.vnua.quiz.model.enums.UserRole;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class AdminUserUpdateRequest extends UpdateProfileRequest {
    private UserRole role;
    private String password;
}
