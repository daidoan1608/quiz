package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.ExamDto;

import java.util.List;

public interface ExamService {
    List<ExamDto> getAllExams();

    List<ExamDto> getExamsBySubjectId(Long subjectId);

    ExamDto getExamById(Long id);

    ExamDto createExam(ExamDto examDto, int numberOfQuestions);

    ExamDto updateExam(Long id, ExamDto examDto);

    void deleteExam(Long id);
}
