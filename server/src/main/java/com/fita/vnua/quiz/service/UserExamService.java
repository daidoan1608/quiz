package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.UserAnswerDto;
import com.fita.vnua.quiz.model.dto.UserExamDto;
import com.fita.vnua.quiz.model.dto.request.UserExamRequest;
import com.fita.vnua.quiz.model.dto.response.UserExamResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface UserExamService {
    UserExamResponse getUserExamById(Long id);

    UserExamDto createUserExam(UserExamRequest userExamRequest);

    List<UserExamResponse> getUserExamByUserId(UUID userId);

    List<Map<Long, Object>> getExamAttemptsByUserId(UUID userId);
}
