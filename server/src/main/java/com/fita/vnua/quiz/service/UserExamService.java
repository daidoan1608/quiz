package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.UserExamDto;
import com.fita.vnua.quiz.model.dto.UserExamSummaryDto;
import com.fita.vnua.quiz.model.dto.request.UserExamRequest;
import com.fita.vnua.quiz.model.dto.response.UserExamResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface UserExamService {
    List<UserExamSummaryDto> getUserExamSummaries();

    UserExamResponse getUserExamById(Long id);

    UserExamDto createUserExam(UserExamRequest userExamRequest);

    List<UserExamResponse> getUserExamByUserId(UUID userId);

    List<Map<Long, Object>> getExamAttemptsByUserId(UUID userId);

    List<UserExamResponse> getAllUserExams();

    List<UserExamResponse> getExamsByUserAndSubject(UUID userId, Long subjectId);

    List<UserExamResponse> getLast7ExamsByUser(UUID userId);
}
