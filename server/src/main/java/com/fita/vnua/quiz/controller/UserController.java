package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.UserDto;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
public class UserController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    // Lấy tất cả người dùng (admin)
    @GetMapping("admin/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        try {
            List<UserDto> users = userService.getAllUsers();
            if (users.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("No user found", List.of("No users available")));
            }
            return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch users", List.of(e.getMessage())));
        }
    }

    // Tìm kiếm người dùng theo từ khóa (admin)
    @GetMapping("admin/users/search")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUserBySearchKey(@RequestParam("key") String keyword) {
        try {
            List<UserDto> users = userService.getUserBySearchKey(keyword);
            if (users.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("No user found", List.of("No users found for the given search key")));
            }
            return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch users", List.of(e.getMessage())));
        }
    }

    // Lấy người dùng theo userId (admin)
    @GetMapping("user/{userId}")
    @Operation(summary = "Get user by ID", description = "This API fetches a user by their ID")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(
            @Parameter(description  = "User ID", required = true) @PathVariable("userId") UUID userId) {
        try {
            UserDto user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("No user found", List.of("No user found for the given ID")));
            }
            return ResponseEntity.ok(ApiResponse.success("User fetched successfully", user));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch user", List.of(e.getMessage())));
        }
    }

    // Tạo người dùng mới (admin)
    @PostMapping("admin/add/users")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@RequestBody UserDto userDto) {
        try {
            userDto.setPassword(passwordEncoder.encode(userDto.getPassword()));
            UserDto saveUser = userService.create(userDto);
            if (saveUser == null) {
                return ResponseEntity.status(400).body(ApiResponse.error("User not created", List.of("Failed to create user")));
            }
            return ResponseEntity.ok(ApiResponse.success("User created successfully", saveUser));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to create user", List.of(e.getMessage())));
        }
    }

    // Cập nhật thông tin người dùng (admin)
    @PatchMapping("update/users/{userId}")
    @Operation(summary = "Delete a user")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId,
            @RequestBody UserDto userDto) {
        try {
            UserDto updatedUser = userService.update(userId, userDto);
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to update user", List.of(e.getMessage())));
        }
    }

    // Xóa người dùng (admin)
    @DeleteMapping("admin/delete/users/{userId}")
    @Operation(summary = "Delete a user")
    public ResponseEntity<ApiResponse<Object>> deleteUser(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId) {
        try {
            userService.delete(userId);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully", "Deleted user with id: " + userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to delete user", List.of(e.getMessage())));
        }
    }
}
