package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.enums.UserRole;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.service.AuthorizationService;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthorizationServiceTest {
    private final AuthorizationService authorizationService = new AuthorizationServiceImpl();

    @Test
    void requireSelfAllowsSameUser() {
        UUID userId = UUID.randomUUID();
        User user = user(userId, UserRole.USER);

        authorizationService.requireSelf(userId, user);
    }

    @Test
    void requireSelfOrAdminModAllowsAdminAndMod() {
        UUID requestedUserId = UUID.randomUUID();

        authorizationService.requireSelfOrAdminMod(requestedUserId, user(UUID.randomUUID(), UserRole.ADMIN));
        authorizationService.requireSelfOrAdminMod(requestedUserId, user(UUID.randomUUID(), UserRole.MOD));
    }

    @Test
    void requireSelfOrAdminModRejectsUnrelatedUserAndAnonymous() {
        UUID requestedUserId = UUID.randomUUID();

        assertThatThrownBy(() -> authorizationService.requireSelfOrAdminMod(requestedUserId, user(UUID.randomUUID(), UserRole.USER)))
                .isInstanceOf(CustomApiException.class)
                .hasMessage("Bạn không có quyền thực hiện thao tác này");
        assertThatThrownBy(() -> authorizationService.requireSelfOrAdminMod(requestedUserId, null))
                .isInstanceOf(CustomApiException.class)
                .hasMessage("Vui lòng đăng nhập để tiếp tục");
    }

    @Test
    void isAdminOrModOnlyMatchesElevatedRoles() {
        assertThat(authorizationService.isAdminOrMod(user(UUID.randomUUID(), UserRole.ADMIN))).isTrue();
        assertThat(authorizationService.isAdminOrMod(user(UUID.randomUUID(), UserRole.MOD))).isTrue();
        assertThat(authorizationService.isAdminOrMod(user(UUID.randomUUID(), UserRole.USER))).isFalse();
        assertThat(authorizationService.isAdminOrMod(null)).isFalse();
    }

    private User user(UUID userId, UserRole role) {
        User user = new User();
        user.setUserId(userId);
        user.setRole(role);
        return user;
    }
}
