package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.entity.User;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthorizationServiceTest {
    private final AuthorizationService authorizationService = new AuthorizationService();

    @Test
    void requireSelfAllowsSameUser() {
        UUID userId = UUID.randomUUID();
        User user = user(userId, User.Role.USER);

        authorizationService.requireSelf(userId, user);
    }

    @Test
    void requireSelfOrAdminModAllowsAdminAndMod() {
        UUID requestedUserId = UUID.randomUUID();

        authorizationService.requireSelfOrAdminMod(requestedUserId, user(UUID.randomUUID(), User.Role.ADMIN));
        authorizationService.requireSelfOrAdminMod(requestedUserId, user(UUID.randomUUID(), User.Role.MOD));
    }

    @Test
    void requireSelfOrAdminModRejectsUnrelatedUserAndAnonymous() {
        UUID requestedUserId = UUID.randomUUID();

        assertThatThrownBy(() -> authorizationService.requireSelfOrAdminMod(requestedUserId, user(UUID.randomUUID(), User.Role.USER)))
                .isInstanceOf(CustomApiException.class)
                .hasMessage("Access denied");
        assertThatThrownBy(() -> authorizationService.requireSelfOrAdminMod(requestedUserId, null))
                .isInstanceOf(CustomApiException.class)
                .hasMessage("Access denied");
    }

    @Test
    void isAdminOrModOnlyMatchesElevatedRoles() {
        assertThat(authorizationService.isAdminOrMod(user(UUID.randomUUID(), User.Role.ADMIN))).isTrue();
        assertThat(authorizationService.isAdminOrMod(user(UUID.randomUUID(), User.Role.MOD))).isTrue();
        assertThat(authorizationService.isAdminOrMod(user(UUID.randomUUID(), User.Role.USER))).isFalse();
        assertThat(authorizationService.isAdminOrMod(null)).isFalse();
    }

    private User user(UUID userId, User.Role role) {
        User user = new User();
        user.setUserId(userId);
        user.setRole(role);
        return user;
    }
}
