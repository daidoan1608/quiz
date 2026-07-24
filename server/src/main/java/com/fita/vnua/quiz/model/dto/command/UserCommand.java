package com.fita.vnua.quiz.model.dto.command;

import com.fita.vnua.quiz.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserCommand {
    private UUID userId;
    private String username;
    private String password;
    private String fullName;
    private String email;
    private UserRole role;
    private String avatarUrl;
    private String phone;
    private String address;
}
