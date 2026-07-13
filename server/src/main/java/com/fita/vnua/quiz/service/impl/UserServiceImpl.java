package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.UserDto;
import com.fita.vnua.quiz.model.dto.request.UpdateProfileRequest;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.model.dto.response.UserResponse;
import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.service.UserService;
import com.fita.vnua.quiz.service.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.ConstraintViolationException;
import org.modelmapper.ModelMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(user -> modelMapper.map(user, UserDto.class)).collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getAllUserResponses() {
        return userRepository.findAll().stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto getUserById(UUID userId) {
        return userRepository.findById(userId)
                .map(user -> modelMapper.map(user, UserDto.class))
                .orElseThrow(() -> new CustomApiException("User not found", HttpStatus.NOT_FOUND));
    }

    @Override
    public UserResponse getUserResponseById(UUID userId) {
        return userRepository.findById(userId)
                .map(userMapper::toUserResponse)
                .orElseThrow(() -> new CustomApiException("User not found", HttpStatus.NOT_FOUND));
    }

    @Override
    public User findEntityById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomApiException("User not found", HttpStatus.NOT_FOUND));
    }

    @Override
    public User findEntityByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    @Override
    public User findEntityByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public List<UserDto> getUserBySearchKey(String keyword) {
        log.info("Searching for users with keyword: {}", keyword);
        if (keyword == null || keyword.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return userRepository.findByUsernameContainingOrFullNameContaining(keyword)
                .stream()
                .map(user -> modelMapper.map(user, UserDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getUserResponsesBySearchKey(String keyword) {
        log.info("Searching for users with keyword: {}", keyword);
        if (keyword == null || keyword.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return userRepository.findByUsernameContainingOrFullNameContaining(keyword)
                .stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }


    @Override
    public UserDto create(UserDto userDto) {
        try {
            User user = modelMapper.map(userDto, User.class);
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
            User savedUser = userRepository.save(user);
            return modelMapper.map(savedUser, UserDto.class);
        } catch (DataIntegrityViolationException ex) {
            // Kiểm tra lỗi có phải do trùng username
            if (ex.getCause() instanceof ConstraintViolationException constraintEx) {
                if (constraintEx.getSQLException().getErrorCode() == 1062) { // Mã lỗi MySQL cho Duplicate Key
                    throw new CustomApiException("Username đã tồn tại", HttpStatus.CONFLICT);
                }
            }
            throw ex;
        }
    }


    @Override
    public UserDto update(UUID userId, UserDto userDto) {
        var existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new CustomApiException("User not found", HttpStatus.NOT_FOUND));
        if (userDto.getFullName() != null) {
            existingUser.setFullName(userDto.getFullName());
        }
        if (userDto.getEmail() != null) {
            existingUser.setEmail(userDto.getEmail());
        }
        if (userDto.getRole() != null) {
            existingUser.setRole(userDto.getRole());
        }
        if (userDto.getAvatarUrl() != null) {
            existingUser.setAvatarUrl(userDto.getAvatarUrl());
        }
        if (userDto.getPhone() != null) {
            existingUser.setPhone(userDto.getPhone());
        }
        if (userDto.getAddress() != null) {
            existingUser.setAddress(userDto.getAddress());
        }
        if (userDto.getPassword() != null && !userDto.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }
        var updatedUser = userRepository.save(existingUser);
        return modelMapper.map(updatedUser, UserDto.class);
    }

    @Override
    public UserDto updateProfile(UUID userId, UpdateProfileRequest request) {
        var existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new CustomApiException("User not found", HttpStatus.NOT_FOUND));
        if (request.getFullName() != null) {
            existingUser.setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            existingUser.setEmail(request.getEmail());
        }
        if (request.getAvatarUrl() != null) {
            existingUser.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getPhone() != null) {
            existingUser.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            existingUser.setAddress(request.getAddress());
        }
        var updatedUser = userRepository.save(existingUser);
        return modelMapper.map(updatedUser, UserDto.class);
    }

    @Override
    public UserResponse updateProfileResponse(UUID userId, UpdateProfileRequest request) {
        var existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new CustomApiException("User not found", HttpStatus.NOT_FOUND));
        if (request.getFullName() != null) {
            existingUser.setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            existingUser.setEmail(request.getEmail());
        }
        if (request.getAvatarUrl() != null) {
            existingUser.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getPhone() != null) {
            existingUser.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            existingUser.setAddress(request.getAddress());
        }
        return userMapper.toUserResponse(userRepository.save(existingUser));
    }

    @Override
    public Response delete(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomApiException("User not found", HttpStatus.NOT_FOUND));
        userRepository.delete(user);
        return Response.builder()
                .responseMessage("User deleted successfully")
                .responseCode("200 OK").build();
    }

    @Override
    public boolean isUsernameExisted(String username) {
        return userRepository.existsUserByUsername(username);
    }

    @Override
    public boolean isEmailExisted(String email) {
        return userRepository.existsUserByEmail(email);
    }

    @Override
    public UserDto getUserByUsername(String username) {
        return userRepository.findByUsername(username).map(user -> modelMapper.map(user, UserDto.class)).orElse(null);
    }

    @Override
    public boolean updateAvatar(UUID userId, String avatarUrl) {
        var existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new CustomApiException("User not found", HttpStatus.NOT_FOUND));
        existingUser.setAvatarUrl(avatarUrl);
        userRepository.save(existingUser);
        return true;
    }
}
