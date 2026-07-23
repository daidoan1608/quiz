package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.enums.AuthProvider;

import com.fita.vnua.quiz.model.dto.command.UserCommand;
import com.fita.vnua.quiz.model.dto.request.ChangePasswordRequest;
import com.fita.vnua.quiz.model.dto.response.UserResponse;
import com.fita.vnua.quiz.model.dto.request.UpdateProfileRequest;
import com.fita.vnua.quiz.model.dto.result.OperationResult;
import com.fita.vnua.quiz.model.entity.User;

import java.util.List;
import java.util.UUID;

public interface UserService {
    List<UserResponse> getAllUserResponses();

    List<UserResponse> getDeletedUserResponses();

    UserResponse getUserResponseById(UUID userId);

    User findEntityById(UUID userId);

    User findEntityByEmail(String email);

    User findEntityByUsername(String username);

    List<UserResponse> searchNotificationRecipients(String keyword, int limit);

    List<UserResponse> filterUsers(String keyword, String role, String authProvider, Boolean emailVerified, Boolean deleted, String sortBy, String sortDir);

    UserCommand create(UserCommand command);

    UserCommand update(UUID userId, UserCommand command);

    UserResponse updateProfileResponse(UUID userId, UpdateProfileRequest request);

    void changePassword(UUID userId, ChangePasswordRequest request);

    OperationResult delete(UUID userId);

    UserResponse restore(UUID userId);

    boolean isUsernameExisted(String username);

    boolean isEmailExisted(String email);

    boolean updateAvatar(UUID userId, String avatarUrl);
}
