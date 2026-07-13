package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.ExamDto;
import com.fita.vnua.quiz.model.dto.ExamSummaryDto;
import com.fita.vnua.quiz.model.dto.request.ExamRequest;

import java.util.List;
import java.util.UUID;

public interface ExamService {
    List<ExamSummaryDto> getAllExams();

    List<ExamSummaryDto> getExamsBySubjectId(Long subjectId);

    ExamDto getExamById(Long id);


    ExamDto createExam(ExamRequest examRequest, UUID currentUserId);

    ExamDto updateExam(Long id, ExamDto examDto);

    void deleteExam(Long id);
}
