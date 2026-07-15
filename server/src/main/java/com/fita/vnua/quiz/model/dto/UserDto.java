package com.fita.vnua.quiz.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fita.vnua.quiz.model.entity.User;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private UUID userId;
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String fullName;
    private String email;
    private User.Role role;
    private String avatarUrl;
    private String phone;
    private String address;
    private Boolean deleted;
    private LocalDateTime deletedAt;
    private UUID deletedBy;
    private UUID deletedCascadeId;
    private String deleteOriginType;
    private Long deleteOriginId;
}
