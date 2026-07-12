package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.UserDto;
import com.fita.vnua.quiz.model.dto.request.ChangePasswordRequest;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
@Tag(name = "User API", description = "API thực hiện các thao tác với người dùng")
public class UserController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @PatchMapping("users/{userId}/password")
    @Operation(summary = "API đổi mật khẩu")
    public ResponseEntity<ApiResponse<Object>> changePassword(
            @PathVariable("userId") UUID userId,
            @RequestBody ChangePasswordRequest request
    ) {
        UserDto userDto = userService.getUserById(userId);

        if (!passwordEncoder.matches(request.getOldPassword(), userDto.getPassword()) || !userDto.getUserId().equals(userId)) {
            throw new CustomApiException("You are not authorized to change this password", HttpStatus.FORBIDDEN);
        }

        userDto.setPassword(request.getNewPassword());
        userService.update(userId, userDto);

        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @GetMapping("admin/users")
    @Operation(summary = "Lấy danh sách tất cả người dùng", description = "This API fetches all users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users));
    }

    @GetMapping("admin/users/search")
    @Operation(summary = "Lấy danh sách người dùng theo từ khóa tìm kiếm", description = "This API fetches users by search key")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUserBySearchKey(@RequestParam("key") String keyword) {
        List<UserDto> users = userService.getUserBySearchKey(keyword);
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users));
    }

    @GetMapping({"users/{userId}", "user/{userId}"})
    @Operation(summary = "Lấy ra người dùng theo ID", description = "This API fetches a user by their ID")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId
    ) {
        UserDto user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("User fetched successfully", user));
    }

    @PatchMapping("users/{userId}")
    @Operation(summary = "Cập nhật thông tin cá nhân", description = "Người dùng cập nhật họ tên, email, số điện thoại, địa chỉ")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId,
            @RequestBody UserDto userDto
    ) {
        UserDto updatedUser = userService.update(userId, userDto);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedUser));
    }

    @PostMapping("admin/users")
    @Operation(summary = "Tạo người dùng mới", description = "This API creates a new user")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@RequestBody UserDto userDto) {
        userDto.setPassword(passwordEncoder.encode(userDto.getPassword()));
        UserDto saveUser = userService.create(userDto);
        return ResponseEntity.ok(ApiResponse.success("User created successfully", saveUser));
    }

    @PatchMapping("admin/users/{userId}")
    @Operation(summary = "Cập nhập thông tin người dùng", description = "This API update info user")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId,
            @RequestBody UserDto userDto
    ) {
        UserDto updatedUser = userService.update(userId, userDto);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
    }

    @DeleteMapping("admin/users/{userId}")
    @Operation(summary = "Xóa người dùng", description = "This API deletes a user")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId
    ) {
        userService.delete(userId);
        return ResponseEntity.noContent().build();
    }
}
