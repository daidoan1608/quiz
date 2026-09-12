package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.response.LearningRoadmapResponse;
import com.fita.vnua.quiz.model.entity.User;

public interface AiRoadmapService {
    LearningRoadmapResponse getPersonalizedRoadmap(User currentUser, boolean forceRefresh);
}
