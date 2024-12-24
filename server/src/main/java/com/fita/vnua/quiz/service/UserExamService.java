package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.UserAnswerDto;
import com.fita.vnua.quiz.model.dto.UserExamDto;
import com.fita.vnua.quiz.model.dto.request.UserExamRequest;
import com.fita.vnua.quiz.model.dto.response.UserExamResponse;

public interface UserExamService {
    UserExamResponse getUserExamById(Long id);

    UserExamDto createUserExam(UserExamRequest userExamRequest);


}
