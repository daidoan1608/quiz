package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.PermissionAssignmentDto;
import com.fita.vnua.quiz.model.dto.request.RoleUpdateRequest;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.model.entity.UserSubjectPermission;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.repository.UserSubjectPermissionRepository;
import com.fita.vnua.quiz.service.AdminPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminPermissionServiceImpl implements AdminPermissionService {
    private static final Set<String> ALLOWED_PERMISSIONS = Set.of("CREATE", "READ", "UPDATE", "DELETE");

    private final UserSubjectPermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    @Override
    @Transactional
    public void assignSubjectPermissions(PermissionAssignmentDto assignment) {
        if (assignment.getModUserId() == null || assignment.getSubjectId() == null || assignment.getPermissions() == null) {
            throw new CustomApiException("Invalid permission assignment", HttpStatus.BAD_REQUEST);
        }

        User targetUser = userRepository.findById(assignment.getModUserId())
                .orElseThrow(() -> new UsernameNotFoundException("User to assign permissions not found."));
        if (Boolean.TRUE.equals(targetUser.getDeleted())) {
            throw new CustomApiException("User to assign permissions not found.", HttpStatus.NOT_FOUND);
        }

        if (targetUser.getRole() != User.Role.MOD) {
            throw new CustomApiException("Object-level permissions can only be assigned to a MOD account.", HttpStatus.BAD_REQUEST);
        }
        var subject = subjectRepository.findById(assignment.getSubjectId())
                .orElseThrow(() -> new CustomApiException("Subject not found", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(subject.getDeleted())) {
            throw new CustomApiException("Subject not found", HttpStatus.NOT_FOUND);
        }

        List<String> normalizedPermissions = assignment.getPermissions()
                .stream()
                .map(this::normalizePermission)
                .distinct()
                .toList();

        permissionRepository.deleteByUserIdAndSubjectId(assignment.getModUserId(), assignment.getSubjectId());
        permissionRepository.flush();

        List<UserSubjectPermission> newPermissions = normalizedPermissions.stream()
                .map(permission -> buildPermission(assignment, permission))
                .collect(Collectors.toList());

        permissionRepository.saveAll(newPermissions);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, List<String>> getPermissionsByModId(UUID userId) {
        return permissionRepository.findAllByUserId(userId).stream()
                .collect(Collectors.groupingBy(
                        UserSubjectPermission::getSubjectId,
                        Collectors.mapping(UserSubjectPermission::getPermissionType, Collectors.toList())
                ));
    }

    @Override
    @Transactional
    public String updateUserRole(UUID userId, RoleUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        if (Boolean.TRUE.equals(user.getDeleted())) {
            throw new CustomApiException("User not found", HttpStatus.NOT_FOUND);
        }

        User.Role newRole = request.getRole();
        user.setRole(newRole);
        userRepository.save(user);

        if (newRole != User.Role.MOD) {
            permissionRepository.deleteByUserId(userId);
        }

        return "Đã cập nhật vai trò thành: " + newRole;
    }

    private UserSubjectPermission buildPermission(PermissionAssignmentDto assignment, String permission) {
        UserSubjectPermission userSubjectPermission = new UserSubjectPermission();
        userSubjectPermission.setUserId(assignment.getModUserId());
        userSubjectPermission.setSubjectId(assignment.getSubjectId());
        userSubjectPermission.setPermissionType(permission);
        return userSubjectPermission;
    }

    private String normalizePermission(String permission) {
        String normalizedPermission = permission == null ? "" : permission.trim().toUpperCase();
        if (!ALLOWED_PERMISSIONS.contains(normalizedPermission)) {
            throw new CustomApiException("Invalid permission: " + permission, HttpStatus.BAD_REQUEST);
        }
        return normalizedPermission;
    }
}
