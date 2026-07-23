package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.enums.AuthProvider;

import com.fita.vnua.quiz.model.enums.UserRole;

import com.fita.vnua.quiz.model.dto.command.UserCommand;
import com.fita.vnua.quiz.model.dto.request.ChangePasswordRequest;
import com.fita.vnua.quiz.model.dto.request.UpdateProfileRequest;
import com.fita.vnua.quiz.model.dto.result.OperationResult;
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
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final RefreshTokenRepository refreshTokenRepository;

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
        UserRole normalizedRole = role == null || role.isBlank() ? null : UserRole.valueOf(role.trim().toUpperCase());
        AuthProvider normalizedProvider = authProvider == null || authProvider.isBlank()
                ? null
                : AuthProvider.valueOf(authProvider.trim().toUpperCase());
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
    public UserCommand create(UserCommand command) {
        try {
            User user = userMapper.toEntity(command);
            user.setPassword(passwordEncoder.encode(command.getPassword()));
            User savedUser = userRepository.save(user);
            return userMapper.toUserCommand(savedUser);
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
    public UserCommand update(UUID userId, UserCommand command) {
        var existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));
        ensureActiveUser(existingUser);
        if (command.getFullName() != null) {
            existingUser.setFullName(command.getFullName());
        }
        if (command.getEmail() != null) {
            existingUser.setEmail(command.getEmail());
        }
        if (command.getRole() != null) {
            validateRoleChange(existingUser, command.getRole());
            existingUser.setRole(command.getRole());
        }
        if (command.getAvatarUrl() != null) {
            existingUser.setAvatarUrl(command.getAvatarUrl());
        }
        if (command.getPhone() != null) {
            existingUser.setPhone(command.getPhone());
        }
        if (command.getAddress() != null) {
            existingUser.setAddress(command.getAddress());
        }
        if (command.getPassword() != null && !command.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(command.getPassword()));
        }
        var updatedUser = userRepository.save(existingUser);
        return userMapper.toUserCommand(updatedUser);
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
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));
        ensureActiveUser(user);
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new CustomApiException("Mật khẩu hiện tại không đúng", HttpStatus.FORBIDDEN);
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new CustomApiException("Mật khẩu mới không được trùng mật khẩu hiện tại", HttpStatus.BAD_REQUEST);
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public OperationResult delete(UUID userId) {
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
        return OperationResult.builder()
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

    private void validateRoleChange(User targetUser, UserRole newRole) {
        User currentUser = currentUser();
        if (currentUser == null || currentUser.getRole() != UserRole.ADMIN) {
            throw new CustomApiException("Chỉ ADMIN mới được thay đổi vai trò người dùng", HttpStatus.FORBIDDEN);
        }

        if (currentUser.getUserId().equals(targetUser.getUserId()) && targetUser.getRole() != newRole) {
            throw new CustomApiException("Không thể tự thay đổi vai trò của chính mình", HttpStatus.BAD_REQUEST);
        }

        if (targetUser.getRole() == UserRole.ADMIN
                && newRole != UserRole.ADMIN
                && userRepository.countByRoleAndDeletedFalse(UserRole.ADMIN) <= 1) {
            throw new CustomApiException("Không thể hạ quyền ADMIN cuối cùng của hệ thống", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateUserDeletion(User targetUser) {
        User currentUser = currentUser();
        if (currentUser != null && currentUser.getUserId().equals(targetUser.getUserId())) {
            throw new CustomApiException("Không thể tự vô hiệu hóa tài khoản của chính mình", HttpStatus.BAD_REQUEST);
        }

        if (targetUser.getRole() == UserRole.ADMIN
                && userRepository.countByRoleAndDeletedFalse(UserRole.ADMIN) <= 1) {
            throw new CustomApiException("Không thể vô hiệu hóa ADMIN cuối cùng của hệ thống", HttpStatus.BAD_REQUEST);
        }
    }
}
