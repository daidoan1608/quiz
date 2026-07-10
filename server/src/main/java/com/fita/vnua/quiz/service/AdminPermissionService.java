package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.PermissionAssignmentDTO;
import com.fita.vnua.quiz.model.dto.request.RoleUpdateRequest;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface AdminPermissionService {
    void assignSubjectPermissions(PermissionAssignmentDTO assignment);

    Map<Long, List<String>> getPermissionsByModId(UUID userId);

    String updateUserRole(UUID userId, RoleUpdateRequest request);
}
