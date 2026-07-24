package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.entity.User;

public interface UserExamAccessService {

    User requireAdminUserExamListAccess(User currentUser, Long categoryId, Long subjectId);

    void requireAdminUserExamAccess(User currentUser, Long userExamId);
}
