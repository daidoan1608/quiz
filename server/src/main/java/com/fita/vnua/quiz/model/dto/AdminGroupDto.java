package com.fita.vnua.quiz.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminGroupDto {
    private Long id;
    @NotBlank(message = "Mã nhóm quyền không được để trống")
    @Size(max = 64, message = "Mã nhóm quyền không được vượt quá 64 ký tự")
    @Pattern(regexp = "^[A-Za-z0-9._\\-]+$", message = "Mã nhóm quyền chỉ được chứa chữ cái, số, dấu chấm, gạch ngang hoặc gạch dưới")
    private String code;
    @NotBlank(message = "Tên nhóm quyền không được để trống")
    @Size(max = 255, message = "Tên nhóm quyền không được vượt quá 255 ký tự")
    private String name;
    @Size(max = 500, message = "Mô tả nhóm quyền không được vượt quá 500 ký tự")
    private String description;
    private Boolean active;
    private Boolean systemManaged;
}
