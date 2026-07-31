package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.AdminGroupDto;
import com.fita.vnua.quiz.model.dto.AdminGroupPermissionDto;
import com.fita.vnua.quiz.model.dto.request.AdminUserGroupAssignmentRequest;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.AdminGroupService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/groups")
@RequiredArgsConstructor
public class AdminGroupController {
    private final AdminGroupService adminGroupService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminGroupDto>>> getGroups() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách nhóm quyền thành công", adminGroupService.getGroups()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<AdminGroupDto>> saveGroup(@Valid @RequestBody AdminGroupDto request) {
        return ResponseEntity.ok(ApiResponse.success("Lưu nhóm quyền thành công", adminGroupService.saveGroup(request)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{groupId}")
    public ResponseEntity<ApiResponse<Object>> deleteGroup(@PathVariable Long groupId) {
        adminGroupService.deleteGroup(groupId);
        return ResponseEntity.ok(ApiResponse.success("Xóa nhóm quyền thành công", null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{groupId}/permissions")
    public ResponseEntity<ApiResponse<List<AdminGroupPermissionDto>>> getPermissions(@PathVariable Long groupId) {
        return ResponseEntity.ok(ApiResponse.success("Lấy quyền của nhóm thành công", adminGroupService.getPermissions(groupId)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{groupId}/permissions")
    public ResponseEntity<ApiResponse<List<AdminGroupPermissionDto>>> savePermissions(
            @PathVariable Long groupId,
            @RequestBody List<@NotNull(message = "Quyền không được để trống") @Valid AdminGroupPermissionDto> permissions
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lưu quyền của nhóm thành công", adminGroupService.savePermissions(groupId, permissions)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<List<AdminGroupDto>>> getUserGroups(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success("Lấy nhóm quyền của MOD thành công", adminGroupService.getUserGroups(userId)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<List<AdminGroupDto>>> assignUserGroups(
            @PathVariable UUID userId,
            @Valid @RequestBody AdminUserGroupAssignmentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Gán nhóm quyền thành công", adminGroupService.assignUserGroups(userId, request.getGroupIds())));
    }
}
