package com.fita.vnua.quiz.service.mapper;

import com.fita.vnua.quiz.model.dto.UserDto;
import com.fita.vnua.quiz.model.dto.request.AdminUserCreateRequest;
import com.fita.vnua.quiz.model.dto.request.AdminUserUpdateRequest;
import com.fita.vnua.quiz.model.dto.response.AuthResponse;
import com.fita.vnua.quiz.model.dto.response.UserResponse;
import com.fita.vnua.quiz.model.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toUserResponse(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .phone(user.getPhone())
                .address(user.getAddress())
                .build();
    }

    public AuthResponse toAuthResponse(User user) {
        UserResponse response = toUserResponse(user);
        return AuthResponse.builder()
                .accessToken(null)
                .refreshToken(null)
                .tokenType(null)
                .userId(response.getUserId())
                .username(response.getUsername())
                .email(response.getEmail())
                .fullName(response.getFullName())
                .role(response.getRole())
                .avatarUrl(response.getAvatarUrl())
                .build();
    }

    public UserDto toUserDto(AdminUserCreateRequest request) {
        UserDto dto = new UserDto();
        dto.setUsername(request.getUsername());
        dto.setPassword(request.getPassword());
        dto.setFullName(request.getFullName());
        dto.setEmail(request.getEmail());
        dto.setRole(request.getRole() != null ? request.getRole() : User.Role.USER);
        dto.setAvatarUrl(request.getAvatarUrl());
        dto.setPhone(request.getPhone());
        dto.setAddress(request.getAddress());
        return dto;
    }

    public UserDto toUserDto(AdminUserUpdateRequest request) {
        UserDto dto = new UserDto();
        dto.setPassword(request.getPassword());
        dto.setFullName(request.getFullName());
        dto.setEmail(request.getEmail());
        dto.setRole(request.getRole());
        dto.setAvatarUrl(request.getAvatarUrl());
        dto.setPhone(request.getPhone());
        dto.setAddress(request.getAddress());
        return dto;
    }
}
