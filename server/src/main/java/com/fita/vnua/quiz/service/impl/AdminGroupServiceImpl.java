package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.enums.UserRole;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.AdminGroupDto;
import com.fita.vnua.quiz.model.dto.AdminGroupPermissionDto;
import com.fita.vnua.quiz.model.entity.AdminGroup;
import com.fita.vnua.quiz.model.entity.AdminGroupPermission;
import com.fita.vnua.quiz.model.entity.AdminUserGroup;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.AdminGroupPermissionRepository;
import com.fita.vnua.quiz.repository.AdminGroupRepository;
import com.fita.vnua.quiz.repository.AdminUserGroupRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.service.AdminGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminGroupServiceImpl implements AdminGroupService {
    private final AdminGroupRepository groupRepository;
    private final AdminGroupPermissionRepository permissionRepository;
    private final AdminUserGroupRepository userGroupRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AdminGroupDto> getGroups() {
        return groupRepository.findAll().stream().map(this::toDto).toList();
    }

    @Override
    @Transactional
    public AdminGroupDto saveGroup(AdminGroupDto request) {
        AdminGroup group = request.getId() == null
                ? new AdminGroup()
                : groupRepository.findById(request.getId())
                .orElseThrow(() -> new CustomApiException("Không tìm thấy nhóm quyền", HttpStatus.NOT_FOUND));
        group.setCode(normalizeCode(request.getCode()));
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setActive(request.getActive() == null || request.getActive());
        group.setSystemManaged(Boolean.TRUE.equals(request.getSystemManaged()));
        return toDto(groupRepository.save(group));
    }

    @Override
    @Transactional
    public void deleteGroup(Long groupId) {
        AdminGroup group = getGroup(groupId);
        if (Boolean.TRUE.equals(group.getSystemManaged())) {
            throw new CustomApiException("Không thể xóa nhóm quyền hệ thống", HttpStatus.BAD_REQUEST);
        }
        groupRepository.delete(group);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminGroupPermissionDto> getPermissions(Long groupId) {
        return permissionRepository.findByGroup(getGroup(groupId)).stream().map(this::toDto).toList();
    }

    @Override
    @Transactional
    public List<AdminGroupPermissionDto> savePermissions(Long groupId, List<AdminGroupPermissionDto> permissions) {
        AdminGroup group = getGroup(groupId);
        permissionRepository.deleteByGroup(group);
        permissionRepository.flush();
        List<AdminGroupPermission> entities = (permissions == null ? List.<AdminGroupPermissionDto>of() : permissions)
                .stream()
                .map(permission -> toEntity(group, permission))
                .toList();
        return permissionRepository.saveAll(entities).stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminGroupDto> getUserGroups(UUID userId) {
        return userGroupRepository.findByUserId(userId).stream()
                .map(AdminUserGroup::getGroup)
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public List<AdminGroupDto> assignUserGroups(UUID userId, List<Long> groupIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));
        if (user.getRole() != UserRole.MOD) {
            throw new CustomApiException("Chỉ gán nhóm quyền cho tài khoản MOD", HttpStatus.BAD_REQUEST);
        }
        userGroupRepository.deleteByUserId(userId);
        List<Long> uniqueGroupIds = (groupIds == null ? List.<Long>of() : groupIds).stream()
                .distinct()
                .toList();
        Map<Long, AdminGroup> groupsById = groupRepository.findAllById(uniqueGroupIds).stream()
                .collect(Collectors.toMap(AdminGroup::getId, group -> group));
        if (groupsById.size() != uniqueGroupIds.size()) {
            throw new CustomApiException("Không tìm thấy nhóm quyền", HttpStatus.NOT_FOUND);
        }
        List<AdminUserGroup> assignments = uniqueGroupIds.stream()
                .map(groupsById::get)
                .map(group -> {
                    AdminUserGroup userGroup = new AdminUserGroup();
                    userGroup.setUserId(userId);
                    userGroup.setGroup(group);
                    return userGroup;
                })
                .toList();
        userGroupRepository.saveAll(assignments);
        return getUserGroups(userId);
    }

    private AdminGroup getGroup(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy nhóm quyền", HttpStatus.NOT_FOUND));
    }

    private AdminGroupDto toDto(AdminGroup group) {
        AdminGroupDto dto = new AdminGroupDto();
        dto.setId(group.getId());
        dto.setCode(group.getCode());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setActive(group.getActive());
        dto.setSystemManaged(group.getSystemManaged());
        return dto;
    }

    private AdminGroupPermissionDto toDto(AdminGroupPermission permission) {
        AdminGroupPermissionDto dto = new AdminGroupPermissionDto();
        dto.setId(permission.getId());
        dto.setScopeType(permission.getScopeType());
        dto.setScopeId(permission.getScopeId());
        dto.setResource(permission.getResource());
        dto.setAction(permission.getAction());
        return dto;
    }

    private AdminGroupPermission toEntity(AdminGroup group, AdminGroupPermissionDto dto) {
        AdminGroupPermission permission = new AdminGroupPermission();
        permission.setGroup(group);
        permission.setScopeType(normalizeCode(dto.getScopeType()));
        if (!permission.getScopeType().equals("GLOBAL") && dto.getScopeId() == null) {
            throw new CustomApiException("Quyền theo phạm vi cụ thể cần có scopeId", HttpStatus.BAD_REQUEST);
        }
        permission.setScopeId(permission.getScopeType().equals("GLOBAL") ? null : dto.getScopeId());
        permission.setResource(normalizeCode(dto.getResource()));
        permission.setAction(normalizeCode(dto.getAction()));
        return permission;
    }

    private String normalizeCode(String value) {
        return value == null ? "" : value.trim().toUpperCase();
    }
}
