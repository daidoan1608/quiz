package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.response.ExamAnalysisResponse;
import com.fita.vnua.quiz.model.entity.User;

public interface AiExamAnalysisService {
    ExamAnalysisResponse analyzeExamResult(Long userExamId, User currentUser);
}
