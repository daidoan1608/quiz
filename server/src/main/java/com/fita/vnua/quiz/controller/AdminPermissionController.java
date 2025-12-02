package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.PermissionAssignmentDTO;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.model.entity.UserSubjectPermission;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.repository.UserSubjectPermissionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/v1/admin/permissions")
@Tag(name = "Authority API", description = "API thao tác phân quyền mod")
@RequiredArgsConstructor
public class AdminPermissionController {
    private final SubjectRepository subjectRepository;
    private final UserSubjectPermissionRepository permissionRepository;
    private final UserRepository userRepository;

    /**
     * Gán quyền (Permissions: ["UPDATE", "DELETE"]) cho Mod (modUserId) trên Subject (subjectId).
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/subject-assignment")
    @Operation(summary = "API cập nhập quyền cho mod")
    public ResponseEntity<String> assignSubjectPermissions(@RequestBody PermissionAssignmentDTO assignment) {

        // 1. Validate User Role (Đảm bảo người được gán là Mod/User, không phải Admin)
        User targetUser = userRepository.findById(assignment.getModUserId())
                .orElseThrow(() -> new UsernameNotFoundException("User to assign permissions not found."));

        // Kiểm tra nếu người dùng đó là ADMIN
        if (targetUser.getRole() == User.Role.ADMIN) {
            return ResponseEntity.badRequest().body("Cannot assign object-level permissions to an ADMIN account.");
            // Hoặc: throw new AccessDeniedException("Cannot modify permissions for an Admin.");
        }

        // 2. Xóa các quyền cũ (giúp cập nhật dễ dàng)
        permissionRepository.deleteByUserIdAndSubjectId(assignment.getModUserId(), assignment.getSubjectId());

        // 3. Chèn các quyền mới
        List<UserSubjectPermission> newPermissions = assignment.getPermissions().stream()
                .map(p -> {
                    UserSubjectPermission usp = new UserSubjectPermission();
                    usp.setUserId(assignment.getModUserId());
                    usp.setSubjectId(assignment.getSubjectId());
                    usp.setPermissionType(p.toUpperCase());
                    return usp;
                })
                .collect(Collectors.toList());

        permissionRepository.saveAll(newPermissions);

        return ResponseEntity.ok("Permissions assigned successfully.");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/mod/{userId}")
    @Operation(summary = "API lấy danh sách quyền của một mod")
    public ResponseEntity<Map<Long, List<String>>> getPermissionsByModId(@PathVariable UUID userId) {

        // 1. Truy vấn tất cả bản ghi quyền của Mod
        List<UserSubjectPermission> permissions = permissionRepository.findAllByUserId(userId);

        if (permissions.isEmpty()) {
            return ResponseEntity.ok(Map.of()); // Trả về Map rỗng nếu không có quyền
        }

        // 2. Nhóm các quyền theo Subject ID
        Map<Long, List<String>> groupedPermissions = permissions.stream()
                .collect(Collectors.groupingBy(
                        // SubjectId là Key
                        UserSubjectPermission::getSubjectId,
                        // List<PermissionType> là Value
                        Collectors.mapping(UserSubjectPermission::getPermissionType, Collectors.toList())
                ));

        return ResponseEntity.ok(groupedPermissions);
    }
}