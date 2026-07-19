package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.UserDto;
import com.fita.vnua.quiz.model.dto.request.AdminUserCreateRequest;
import com.fita.vnua.quiz.model.dto.request.AdminUserUpdateRequest;
import com.fita.vnua.quiz.model.dto.request.ChangePasswordRequest;
import com.fita.vnua.quiz.model.dto.request.UpdateProfileRequest;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.dto.response.UserResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.service.AuthorizationService;
import com.fita.vnua.quiz.service.AuditLogService;
import com.fita.vnua.quiz.service.UserService;
import com.fita.vnua.quiz.service.mapper.UserMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final AuthorizationService authorizationService;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;

    @PatchMapping("users/{userId}/password")
    @Operation(summary = "API đổi mật khẩu")
    public ResponseEntity<ApiResponse<Object>> changePassword(
            @PathVariable("userId") UUID userId,
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        authorizationService.requireSelf(userId, currentUser);
        UserDto userDto = userService.getUserById(userId);

        if (!passwordEncoder.matches(request.getOldPassword(), currentUser.getPassword())) {
            throw new CustomApiException("Mật khẩu hiện tại không đúng", HttpStatus.FORBIDDEN);
        }
        if (passwordEncoder.matches(request.getNewPassword(), currentUser.getPassword())) {
            throw new CustomApiException("Mật khẩu mới không được trùng mật khẩu hiện tại", HttpStatus.BAD_REQUEST);
        }

        userDto.setPassword(request.getNewPassword());
        userService.update(userId, userDto);

        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/users/filter")
    @Operation(summary = "Lọc danh sách người dùng cho admin")
    public ResponseEntity<ApiResponse<List<UserResponse>>> filterUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String authProvider,
            @RequestParam(required = false) Boolean emailVerified,
            @RequestParam(required = false) Boolean deleted,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lọc người dùng thành công",
                userService.filterUsers(keyword, role, authProvider, emailVerified, deleted, sortBy, sortDir)
        ));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/users/deleted")
    @Operation(summary = "Lấy danh sách người dùng đã vô hiệu hóa")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getDeletedUsers() {
        List<UserResponse> users = userService.getDeletedUserResponses();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách người dùng đã vô hiệu hóa thành công", users));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/users")
    @Operation(summary = "Lấy danh sách tất cả người dùng", description = "This API fetches all users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.getAllUserResponses();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách người dùng thành công", users));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/users/search")
    @Operation(summary = "Lấy danh sách người dùng theo từ khóa tìm kiếm", description = "This API fetches users by search key")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUserBySearchKey(
            @RequestParam("key") String keyword,
            @RequestParam(defaultValue = "20") int limit
    ) {
        List<UserResponse> users = userService.searchNotificationRecipients(keyword, limit);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm người dùng thành công", users));
    }

    @GetMapping({"users/{userId}", "user/{userId}"})
    @Operation(summary = "Lấy ra người dùng theo ID", description = "This API fetches a user by their ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId,
            @AuthenticationPrincipal User currentUser
    ) {
        authorizationService.requireSelfOrAdminMod(userId, currentUser);
        UserResponse user = userService.getUserResponseById(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công", user));
    }

    @PatchMapping("users/{userId}")
    @Operation(summary = "Cập nhật thông tin cá nhân", description = "Người dùng cập nhật họ tên, email, số điện thoại, địa chỉ")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId,
            @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        authorizationService.requireSelfOrAdminMod(userId, currentUser);
        UserResponse updatedUser = userService.updateProfileResponse(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật hồ sơ thành công", updatedUser));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("admin/users")
    @Operation(summary = "Tạo người dùng mới", description = "This API creates a new user")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@RequestBody AdminUserCreateRequest request, @AuthenticationPrincipal User currentUser) {
        UserDto userDto = userMapper.toUserDto(request);
        UserDto saveUser = userService.create(userDto);
        auditLogService.record("CREATE", "USER", saveUser.getUserId(), currentUser, saveUser.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Tạo người dùng thành công", userService.getUserResponseById(saveUser.getUserId())));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("admin/users/{userId}")
    @Operation(summary = "Cập nhập thông tin người dùng", description = "This API update info user")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId,
            @RequestBody AdminUserUpdateRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        UserDto userDto = userMapper.toUserDto(request);
        UserDto updatedUser = userService.update(userId, userDto);
        auditLogService.record("UPDATE", "USER", userId, currentUser, updatedUser.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật người dùng thành công", userService.getUserResponseById(updatedUser.getUserId())));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("admin/users/{userId}")
    @Operation(summary = "Xóa người dùng", description = "This API deletes a user")
    public ResponseEntity<ApiResponse<Object>> deleteUser(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId,
            @AuthenticationPrincipal User currentUser
    ) {
        userService.delete(userId);
        auditLogService.record("DELETE", "USER", userId, currentUser, "Disable user");
        return ResponseEntity.ok(ApiResponse.success("Vô hiệu hóa người dùng thành công", null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("admin/users/{userId}/restore")
    @Operation(summary = "Khôi phục người dùng đã vô hiệu hóa")
    public ResponseEntity<ApiResponse<UserResponse>> restoreUser(
            @Parameter(description = "User ID", required = true) @PathVariable("userId") UUID userId
    ) {
        return ResponseEntity.ok(ApiResponse.success("Khôi phục người dùng thành công", userService.restore(userId)));
    }
}
