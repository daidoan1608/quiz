package com.fita.vnua.quiz.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fita.vnua.quiz.model.enums.AuthProvider;
import com.fita.vnua.quiz.model.enums.UserRole;
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
@JsonIgnoreProperties(ignoreUnknown = true)
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
    private UserRole role;

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

    @PrePersist
    private void prePersist() {
        if (deleted == null) {
            deleted = false;
        }
    }

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.role.name()));
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        // Tài khoản quản trị được tạo nội bộ không cần luồng xác thực email như USER đăng ký.
        // Nếu không cho ADMIN/MOD enabled ở đây, Spring Security sẽ chặn đăng nhập dù đúng mật khẩu.
        return !Boolean.TRUE.equals(deleted)
                && (role == UserRole.ADMIN || role == UserRole.MOD || emailVerified || authProvider != AuthProvider.LOCAL);
    }
}
