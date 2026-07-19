package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.AdminGroupDto;
import com.fita.vnua.quiz.model.dto.AdminGroupPermissionDto;

import java.util.List;
import java.util.UUID;

public interface AdminGroupService {
    List<AdminGroupDto> getGroups();

    AdminGroupDto saveGroup(AdminGroupDto request);

    void deleteGroup(Long groupId);

    List<AdminGroupPermissionDto> getPermissions(Long groupId);

    List<AdminGroupPermissionDto> savePermissions(Long groupId, List<AdminGroupPermissionDto> permissions);

    List<AdminGroupDto> getUserGroups(UUID userId);

    List<AdminGroupDto> assignUserGroups(UUID userId, List<Long> groupIds);
}
