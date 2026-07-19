package com.fita.vnua.quiz.model.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class AdminUserGroupAssignmentRequest {
    private List<Long> groupIds;
}
