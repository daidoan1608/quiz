package com.fita.vnua.quiz.model.dto.response;

import com.fita.vnua.quiz.model.dto.SoftDeleteMetadataDto;
import com.fita.vnua.quiz.model.enums.UserRole;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse extends SoftDeleteMetadataDto {
    private UUID userId;
    private String username;
    private String fullName;
    private String email;
    private UserRole role;
    private String avatarUrl;
    private String phone;
    private String address;
}
