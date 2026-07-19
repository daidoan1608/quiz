package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.ExamDto;
import com.fita.vnua.quiz.model.dto.ExamSummaryDto;
import com.fita.vnua.quiz.model.dto.request.ExamRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ExamService {
    List<ExamSummaryDto> getAllExams();

    List<ExamSummaryDto> getDeletedExams();

    List<ExamSummaryDto> getExamsBySubjectId(Long subjectId);

    List<ExamSummaryDto> filterExams(String keyword, Long categoryId, Long subjectId, UUID createdBy, Boolean deleted, String sortBy, String sortDir);

    Page<ExamSummaryDto> filterExamsPage(String keyword, Long categoryId, Long subjectId, UUID createdBy, Boolean deleted, Pageable pageable);

    ExamDto getExamById(Long id);

    ExamDto getExamByIdForSubmittedAttempt(Long examId, Long userExamId, UUID currentUserId);


    ExamDto createExam(ExamRequest examRequest, UUID currentUserId);

    ExamDto updateExam(Long id, ExamDto examDto);

    void deleteExam(Long id);

    ExamDto restoreExam(Long id);
}
