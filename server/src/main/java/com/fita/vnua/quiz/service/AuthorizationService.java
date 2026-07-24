package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.entity.User;

import java.util.UUID;

public interface AuthorizationService {
    User requireAuthenticated(User currentUser);

    void requireSelfOrAdminMod(UUID requestedUserId, User currentUser);

    void requireSelf(UUID requestedUserId, User currentUser);

    boolean isAdminOrMod(User user);
}
