package com.fita.vnua.quiz.model.dto;

import lombok.Data;

@Data
public class AdminGroupPermissionDto {
    private Long id;
    private String scopeType;
    private Long scopeId;
    private String resource;
    private String action;
}
