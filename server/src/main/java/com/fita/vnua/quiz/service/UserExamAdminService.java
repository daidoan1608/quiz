package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.response.UserExamResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface UserExamAdminService {
    Page<UserExamResponse> getAllUserExamsForAdmin(
            String keyword,
            Long categoryId,
            Long subjectId,
            LocalDateTime startedFrom,
            LocalDateTime startedTo,
            Pageable pageable
    );

    UserExamResponse getUserExamByIdForAdmin(Long id);
}