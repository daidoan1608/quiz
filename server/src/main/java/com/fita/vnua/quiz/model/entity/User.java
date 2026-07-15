package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Data
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID userId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = true)
    private String password;

    @Column(unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role; // Enum: ADMIN, MOD, USER

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = true)
    private String avatarUrl;

    @Column(nullable = true)
    private String phone;

    @Column(nullable = true)
    private String address;

    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(nullable = false)
    private boolean emailVerified = false;

    @Column(nullable = false)
    private Boolean deleted = false;

    private LocalDateTime deletedAt;

    private UUID deletedBy;

    private UUID deletedCascadeId;

    private String deleteOriginType;

    private Long deleteOriginId;

    public enum AuthProvider {
        LOCAL, GOOGLE, FACEBOOK, GITHUB
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        // Tài khoản quản trị được tạo nội bộ không cần luồng xác thực email như USER đăng ký.
        // Nếu không cho ADMIN/MOD enabled ở đây, Spring Security sẽ chặn đăng nhập dù đúng mật khẩu.
        return !Boolean.TRUE.equals(deleted)
                && (role == Role.ADMIN || role == Role.MOD || emailVerified || authProvider != AuthProvider.LOCAL);
    }

    public enum Role {
        ADMIN, MOD, USER
    }
}
