package com.fita.vnua.quiz.model.dto.request;

import com.fita.vnua.quiz.model.dto.ExamDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamRequest {
    private ExamDto examDto;
    private int totalQuestions;
    private int easyQuestions;
    private int hardQuestions;
    private int mediumQuestions;
    private Map<Long,Integer> totalQuestionByChapter;
    private String generationMode;
    private List<Long> questionIds;
}
