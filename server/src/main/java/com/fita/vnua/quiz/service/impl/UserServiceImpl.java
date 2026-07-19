package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.UserDto;
import com.fita.vnua.quiz.model.dto.request.UpdateProfileRequest;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.model.dto.response.UserResponse;
import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.RefreshTokenRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.service.UserService;
import com.fita.vnua.quiz.service.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.ConstraintViolationException;
import org.modelmapper.ModelMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findByDeletedFalse().stream().map(user -> modelMapper.map(user, UserDto.class)).collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getAllUserResponses() {
        return userRepository.findByDeletedFalse().stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getDeletedUserResponses() {
        return userRepository.findByDeletedTrue().stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto getUserById(UUID userId) {
        return userRepository.findById(userId)
                .filter(user -> !Boolean.TRUE.equals(user.getDeleted()))
                .map(user -> modelMapper.map(user, UserDto.class))
                .orElseThrow(() -> new CustomApiException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));
    }

    @Override
    public UserResponse getUserResponseById(UUID userId) {
        return userRepository.findById(userId)
                .filter(user -> !Boolean.TRUE.equals(user.getDeleted()))
                .map(userMapper::toUserResponse)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));
    }

    @Override
    public User findEntityById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));
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
    public List<UserResponse> searchNotificationRecipients(String keyword, int limit) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new ArrayList<>();
        }
        int normalizedLimit = Math.max(1, Math.min(limit, 50));
        return userRepository.searchActiveUsersForNotification(keyword.trim(), PageRequest.of(0, normalizedLimit))
                .stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> filterUsers(String keyword, String role, String authProvider, Boolean emailVerified, Boolean deleted, String sortBy, String sortDir) {
        String normalizedKeyword = keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();
        User.Role normalizedRole = role == null || role.isBlank() ? null : User.Role.valueOf(role.trim().toUpperCase());
        User.AuthProvider normalizedProvider = authProvider == null || authProvider.isBlank()
                ? null
                : User.AuthProvider.valueOf(authProvider.trim().toUpperCase());
        List<UserResponse> users = userRepository.filterUsers(normalizedKeyword, normalizedRole, normalizedProvider, emailVerified, deleted).stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
        return AdminSortHelper.sort(users, sortBy, sortDir, Map.of(
                "userId", user -> user.getUserId().toString(),
                "username", UserResponse::getUsername,
                "fullName", UserResponse::getFullName,
                "email", UserResponse::getEmail,
                "role", user -> user.getRole() == null ? null : user.getRole().name(),
                "deletedAt", UserResponse::getDeletedAt
        ));
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
                    throw new CustomApiException("Tên đăng nhập đã tồn tại", HttpStatus.CONFLICT);
                }
            }
            throw ex;
        }
    }


    @Override
    public UserDto update(UUID userId, UserDto userDto) {
        var existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));
        ensureActiveUser(existingUser);
        if (userDto.getFullName() != null) {
            existingUser.setFullName(userDto.getFullName());
        }
        if (userDto.getEmail() != null) {
            existingUser.setEmail(userDto.getEmail());
        }
        if (userDto.getRole() != null) {
            validateRoleChange(existingUser, userDto.getRole());
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
                .orElseThrow(() -> new CustomApiException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));
        ensureActiveUser(existingUser);
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
                .orElseThrow(() -> new CustomApiException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));
        ensureActiveUser(existingUser);
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
    @Transactional
    public Response delete(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));
        validateUserDeletion(user);
        if (!Boolean.TRUE.equals(user.getDeleted())) {
            user.setDeleted(true);
            user.setDeletedAt(LocalDateTime.now());
            user.setDeletedBy(currentActorId());
            user.setDeletedCascadeId(UUID.randomUUID());
            user.setDeleteOriginType("USER");
            user.setDeleteOriginId(null);
            userRepository.save(user);
        }
        refreshTokenRepository.revokeAllByUserId(userId);
        return Response.builder()
                .responseMessage("Vô hiệu hóa người dùng thành công")
                .responseCode("200 OK").build();
    }

    @Override
    @Transactional
    public UserResponse restore(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));
        user.setDeleted(false);
        user.setDeletedAt(null);
        user.setDeletedBy(null);
        user.setDeletedCascadeId(null);
        user.setDeleteOriginType(null);
        user.setDeleteOriginId(null);
        return userMapper.toUserResponse(userRepository.save(user));
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
                .orElseThrow(() -> new CustomApiException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));
        ensureActiveUser(existingUser);
        existingUser.setAvatarUrl(avatarUrl);
        userRepository.save(existingUser);
        return true;
    }

    private UUID currentActorId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return user.getUserId();
        }
        return null;
    }

    private User currentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return user;
        }
        return null;
    }

    private void ensureActiveUser(User user) {
        if (Boolean.TRUE.equals(user.getDeleted())) {
            throw new CustomApiException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND);
        }
    }

    private void validateRoleChange(User targetUser, User.Role newRole) {
        User currentUser = currentUser();
        if (currentUser == null || currentUser.getRole() != User.Role.ADMIN) {
            throw new CustomApiException("Chỉ ADMIN mới được thay đổi vai trò người dùng", HttpStatus.FORBIDDEN);
        }

        if (currentUser.getUserId().equals(targetUser.getUserId()) && targetUser.getRole() != newRole) {
            throw new CustomApiException("Không thể tự thay đổi vai trò của chính mình", HttpStatus.BAD_REQUEST);
        }

        if (targetUser.getRole() == User.Role.ADMIN
                && newRole != User.Role.ADMIN
                && userRepository.countByRoleAndDeletedFalse(User.Role.ADMIN) <= 1) {
            throw new CustomApiException("Không thể hạ quyền ADMIN cuối cùng của hệ thống", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateUserDeletion(User targetUser) {
        User currentUser = currentUser();
        if (currentUser != null && currentUser.getUserId().equals(targetUser.getUserId())) {
            throw new CustomApiException("Không thể tự vô hiệu hóa tài khoản của chính mình", HttpStatus.BAD_REQUEST);
        }

        if (targetUser.getRole() == User.Role.ADMIN
                && userRepository.countByRoleAndDeletedFalse(User.Role.ADMIN) <= 1) {
            throw new CustomApiException("Không thể vô hiệu hóa ADMIN cuối cùng của hệ thống", HttpStatus.BAD_REQUEST);
        }
    }
}
