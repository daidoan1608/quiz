package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.UserDto;
import com.fita.vnua.quiz.model.dto.response.UserResponse;
import com.fita.vnua.quiz.model.dto.request.UpdateProfileRequest;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.model.entity.User;

import java.util.List;
import java.util.UUID;

public interface UserService {
    List<UserDto> getAllUsers();

    List<UserResponse> getAllUserResponses();

    UserDto getUserById(UUID userId);

    UserResponse getUserResponseById(UUID userId);

    User findEntityById(UUID userId);

    User findEntityByEmail(String email);

    User findEntityByUsername(String username);

    List<UserDto> getUserBySearchKey(String keyword);

    List<UserResponse> getUserResponsesBySearchKey(String keyword);

    UserDto create(UserDto userDto);

    UserDto update(UUID userId, UserDto userDto);

    UserDto updateProfile(UUID userId, UpdateProfileRequest request);

    UserResponse updateProfileResponse(UUID userId, UpdateProfileRequest request);

    Response delete(UUID userId);

    boolean isUsernameExisted(String username);

    boolean isEmailExisted(String email);

    UserDto getUserByUsername(String username);

    boolean updateAvatar(UUID userId, String avatarUrl);
}
