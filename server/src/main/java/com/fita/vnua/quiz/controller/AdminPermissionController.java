package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.PermissionAssignmentDto;
import com.fita.vnua.quiz.model.dto.request.RoleUpdateRequest;
import com.fita.vnua.quiz.service.AdminPermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("api/v1/admin/permissions")
@Tag(name = "Authority API", description = "API thao tác phân quyền mod")
@RequiredArgsConstructor
public class AdminPermissionController {
    private final AdminPermissionService adminPermissionService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/subject-assignment")
    @Operation(summary = "API cập nhập quyền cho mod")
    public ResponseEntity<String> assignSubjectPermissions(@RequestBody PermissionAssignmentDto assignment) {
        adminPermissionService.assignSubjectPermissions(assignment);
        return ResponseEntity.ok("Permissions assigned successfully.");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/mod/{userId}")
    @Operation(summary = "API lấy danh sách quyền của một mod")
    public ResponseEntity<Map<Long, List<String>>> getPermissionsByModId(@PathVariable UUID userId) {
        return ResponseEntity.ok(adminPermissionService.getPermissionsByModId(userId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/user/{userId}/role")
    @Operation(summary = "API thay đổi vai trò người dùng")
    public ResponseEntity<String> updateUserRole(
            @PathVariable UUID userId,
            @RequestBody RoleUpdateRequest request
    ) {
        return ResponseEntity.ok(adminPermissionService.updateUserRole(userId, request));
    }
}
