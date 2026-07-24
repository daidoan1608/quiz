package com.fita.vnua.quiz.service.mapper;

import com.fita.vnua.quiz.model.enums.UserRole;

import com.fita.vnua.quiz.model.dto.command.UserCommand;
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
                .deleted(user.getDeleted())
                .deletedAt(user.getDeletedAt())
                .deletedBy(user.getDeletedBy())
                .deletedCascadeId(user.getDeletedCascadeId())
                .deleteOriginType(user.getDeleteOriginType())
                .deleteOriginId(user.getDeleteOriginId())
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
                .authProvider(user.getAuthProvider())
                .hasPassword(user.getPassword() != null && !user.getPassword().isBlank())
                .avatarUrl(response.getAvatarUrl())
                .build();
    }

    public UserCommand toUserCommand(AdminUserCreateRequest request) {
        UserCommand dto = new UserCommand();
        dto.setUsername(request.getUsername());
        dto.setPassword(request.getPassword());
        dto.setFullName(request.getFullName());
        dto.setEmail(request.getEmail());
        dto.setRole(request.getRole() != null ? request.getRole() : UserRole.USER);
        dto.setAvatarUrl(request.getAvatarUrl());
        dto.setPhone(request.getPhone());
        dto.setAddress(request.getAddress());
        return dto;
    }

    public UserCommand toUserCommand(AdminUserUpdateRequest request) {
        UserCommand dto = new UserCommand();
        dto.setPassword(request.getPassword());
        dto.setFullName(request.getFullName());
        dto.setEmail(request.getEmail());
        dto.setRole(request.getRole());
        dto.setAvatarUrl(request.getAvatarUrl());
        dto.setPhone(request.getPhone());
        dto.setAddress(request.getAddress());
        return dto;
    }

    public User toEntity(UserCommand dto) {
        User user = new User();
        user.setUserId(dto.getUserId());
        user.setUsername(dto.getUsername());
        user.setPassword(dto.getPassword());
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole() != null ? dto.getRole() : UserRole.USER);
        user.setAvatarUrl(dto.getAvatarUrl());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());
        user.setDeleted(false);
        return user;
    }

    public UserCommand toUserCommand(User user) {
        UserCommand dto = new UserCommand();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setPassword(user.getPassword());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        return dto;
    }
}
