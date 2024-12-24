package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;

import java.util.UUID;

@Entity
@Data
@Getter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID userId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role; // Enum: ADMIN, MOD, USER

    @Column(nullable = false)
    private String fullName;

    public enum Role {
        ADMIN, MOD, USER
    }
}
