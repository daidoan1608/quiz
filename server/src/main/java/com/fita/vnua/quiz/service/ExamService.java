package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.ExamDto;
import com.fita.vnua.quiz.model.dto.ExamSummaryDto;
import com.fita.vnua.quiz.model.dto.request.ExamRequest;

import java.util.List;

public interface ExamService {
    List<ExamSummaryDto> getAllExams();

    List<ExamSummaryDto> getExamsBySubjectId(Long subjectId);

    ExamDto getExamById(Long id);


    ExamDto createExam(ExamRequest examRequest);

    ExamDto updateExam(Long id, ExamDto examDto);

    void deleteExam(Long id);
}
