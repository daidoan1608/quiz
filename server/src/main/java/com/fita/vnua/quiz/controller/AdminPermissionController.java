package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.PermissionAssignmentDTO;
import com.fita.vnua.quiz.model.entity.UserSubjectPermission;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.repository.UserSubjectPermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/v1/admin/permissions")
@RequiredArgsConstructor
public class AdminPermissionController {
    private final SubjectRepository subjectRepository;
    private final UserSubjectPermissionRepository permissionRepository;
    // ... (UserRepository)

    /**
     * Gán quyền (Permissions: ["UPDATE", "DELETE"]) cho Mod (modUserId) trên Subject (subjectId).
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/subject-assignment")
    public ResponseEntity<String> assignSubjectPermissions(@RequestBody PermissionAssignmentDTO assignment) {

        // 1. Validate User Role (Đảm bảo người được gán là Mod/User, không phải Admin)
        // ... (Logic đã trình bày ở câu trả lời trước)

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