package com.fita.vnua.quiz.model.dto;

import lombok.Data;

@Data
public class AdminGroupDto {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Boolean active;
    private Boolean systemManaged;
}
