package com.fita.vnua.quiz.model.dto.request;

import com.fita.vnua.quiz.model.enums.UserRole;

import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class AdminUserUpdateRequest extends UpdateProfileRequest {
    private UserRole role;
    @Pattern(regexp = "^$|^(?=.{8,72}$)(?=.*[A-Za-z])(?=.*\\d).+$", message = "Mật khẩu phải có từ 8 đến 72 ký tự và có cả chữ lẫn số")
    private String password;
}
