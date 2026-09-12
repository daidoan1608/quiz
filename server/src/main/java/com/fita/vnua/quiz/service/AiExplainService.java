package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.request.ExplainQuestionRequest;
import com.fita.vnua.quiz.model.dto.response.ExplainQuestionResponse;
import com.fita.vnua.quiz.model.entity.User;

public interface AiExplainService {
    ExplainQuestionResponse explainQuestion(ExplainQuestionRequest request, User currentUser);
}
