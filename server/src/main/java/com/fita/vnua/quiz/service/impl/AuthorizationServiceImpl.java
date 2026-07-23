package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthorizationService {
    private static final String LOGIN_REQUIRED = "Vui lòng đăng nhập để tiếp tục";
    private static final String ACCESS_DENIED = "Bạn không có quyền thực hiện thao tác này";

    public User requireAuthenticated(User currentUser) {
        if (currentUser == null) {
            throw new CustomApiException("UNAUTHORIZED", LOGIN_REQUIRED, HttpStatus.UNAUTHORIZED);
        }
        return currentUser;
    }

    public void requireSelfOrAdminMod(UUID requestedUserId, User currentUser) {
        User authenticatedUser = requireAuthenticated(currentUser);
        if (!authenticatedUser.getUserId().equals(requestedUserId) && !isAdminOrMod(authenticatedUser)) {
            throw new CustomApiException("FORBIDDEN", ACCESS_DENIED, HttpStatus.FORBIDDEN);
        }
    }

    public void requireSelf(UUID requestedUserId, User currentUser) {
        User authenticatedUser = requireAuthenticated(currentUser);
        if (!authenticatedUser.getUserId().equals(requestedUserId)) {
            throw new CustomApiException("FORBIDDEN", ACCESS_DENIED, HttpStatus.FORBIDDEN);
        }
    }

    public boolean isAdminOrMod(User user) {
        return user != null && (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.MOD);
    }
}
