package com.fita.vnua.quiz.model.dto.response;

import com.fita.vnua.quiz.model.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private UUID userId;
    private String username;
    private String fullName;
    private String email;
    private User.Role role;
    private String avatarUrl;
}
