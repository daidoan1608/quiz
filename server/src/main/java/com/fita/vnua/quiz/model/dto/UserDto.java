package com.fita.vnua.quiz.model.dto;

import com.fita.vnua.quiz.model.entity.User;
import lombok.*;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private UUID userId;
    private String username;
    private String password;
    private String fullName;
    private String email;
    private User.Role role;
    private String avatarUrl;
}
