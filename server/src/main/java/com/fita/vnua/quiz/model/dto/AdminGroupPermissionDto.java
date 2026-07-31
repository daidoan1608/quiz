package com.fita.vnua.quiz.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AdminGroupPermissionDto {
    private Long id;
    @NotBlank(message = "Phạm vi quyền không được để trống")
    @Pattern(regexp = "(?i)GLOBAL|CATEGORY|SUBJECT|CHAPTER|EXAM|QUESTION", message = "Phạm vi quyền không hợp lệ")
    private String scopeType;
    private Long scopeId;
    @NotBlank(message = "Tài nguyên quyền không được để trống")
    private String resource;
    @NotBlank(message = "Hành động quyền không được để trống")
    private String action;
}
