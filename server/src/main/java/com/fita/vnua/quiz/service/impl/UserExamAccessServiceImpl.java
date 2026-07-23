package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.repository.UserExamRepository;
import com.fita.vnua.quiz.service.AdminCapabilityService;
import com.fita.vnua.quiz.service.AuthorizationService;
import com.fita.vnua.quiz.service.UserExamAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserExamAccessServiceImpl implements UserExamAccessService {

    private final AuthorizationService authorizationService;
    private final AdminCapabilityService adminCapabilityService;
    private final UserExamRepository userExamRepository;
    private final SubjectRepository subjectRepository;

    @Override
    public User requireAdminUserExamListAccess(User currentUser, Long categoryId, Long subjectId) {
        User authenticatedUser = authorizationService.requireAuthenticated(currentUser);
        if (adminCapabilityService.hasPermission(authenticatedUser, "USER_EXAM", "VIEW", "GLOBAL", null)) {
            return authenticatedUser;
        }
        if (subjectId != null) {
            requireSubjectScope(authenticatedUser, subjectId);
            if (categoryId != null && !subjectRepository.existsActiveSubjectInCategory(subjectId, categoryId)) {
                throw new AccessDeniedException("Môn không thuộc khoa được chọn");
            }
            return authenticatedUser;
        }
        if (categoryId != null && hasAllowedSubjectInCategory(authenticatedUser, categoryId)) {
            return authenticatedUser;
        }
        throw new AccessDeniedException("Không có quyền xem bài thi người dùng trong phạm vi này");
    }

    @Override
    public void requireAdminUserExamAccess(User currentUser, Long userExamId) {
        if (adminCapabilityService.hasPermission(currentUser, "USER_EXAM", "VIEW", "GLOBAL", null)) {
            return;
        }
        Long subjectId = userExamRepository.findSubjectIdByUserExamId(userExamId).orElse(null);
        if (subjectId == null || !adminCapabilityService.hasPermission(currentUser, "USER_EXAM", "VIEW", "SUBJECT", subjectId)) {
            throw new AccessDeniedException("Không có quyền xem bài thi của người dùng thuộc môn này");
        }
    }

    private void requireSubjectScope(User authenticatedUser, Long subjectId) {
        if (!adminCapabilityService.hasPermission(authenticatedUser, "USER_EXAM", "VIEW", "SUBJECT", subjectId)) {
            throw new AccessDeniedException("Không có quyền xem bài thi người dùng của môn này");
        }
    }

    private boolean hasAllowedSubjectInCategory(User authenticatedUser, Long categoryId) {
        return adminCapabilityService
                .getAllowedSubjectIds(authenticatedUser, "USER_EXAM", "VIEW")
                .stream()
                .anyMatch(allowedSubjectId -> subjectRepository.existsActiveSubjectInCategory(allowedSubjectId, categoryId));
    }
}
