package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.response.AdminCapabilitiesResponse;
import com.fita.vnua.quiz.model.entity.User;

public interface AdminCapabilityService {
    AdminCapabilitiesResponse getCapabilities(User user);

    boolean hasPermission(User user, String resource, String action, String scopeType, Long scopeId);

    boolean hasAnyPermission(User user, String resource, String action);

    java.util.List<Long> getAllowedSubjectIds(User user, String resource, String action);
}
