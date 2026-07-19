package com.fita.vnua.quiz.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminCapabilitiesResponse {
    private List<String> menus;
    private Map<String, Map<String, List<String>>> subjects;
    private Map<String, List<String>> global;
}
