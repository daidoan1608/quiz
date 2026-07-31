package com.fita.vnua.quiz.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AdminUserGroupAssignmentRequest {
    private List<@NotNull(message = "Nhóm quyền không được để trống") Long> groupIds;
}
