package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.enums.UserRole;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.service.AuthorizationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthorizationServiceImpl implements AuthorizationService {
    private static final String LOGIN_REQUIRED = "Vui lòng đăng nhập để tiếp tục";
    private static final String ACCESS_DENIED = "Bạn không có quyền thực hiện thao tác này";

    @Override
    public User requireAuthenticated(User currentUser) {
        if (currentUser == null) {
            throw new CustomApiException("UNAUTHORIZED", LOGIN_REQUIRED, HttpStatus.UNAUTHORIZED);
        }
        return currentUser;
    }

    @Override
    public void requireSelfOrAdminMod(UUID requestedUserId, User currentUser) {
        User authenticatedUser = requireAuthenticated(currentUser);
        if (!authenticatedUser.getUserId().equals(requestedUserId) && !isAdminOrMod(authenticatedUser)) {
            throw new CustomApiException("FORBIDDEN", ACCESS_DENIED, HttpStatus.FORBIDDEN);
        }
    }

    @Override
    public void requireSelf(UUID requestedUserId, User currentUser) {
        User authenticatedUser = requireAuthenticated(currentUser);
        if (!authenticatedUser.getUserId().equals(requestedUserId)) {
            throw new CustomApiException("FORBIDDEN", ACCESS_DENIED, HttpStatus.FORBIDDEN);
        }
    }

    @Override
    public boolean isAdminOrMod(User user) {
        return user != null && (user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.MOD);
    }
}
