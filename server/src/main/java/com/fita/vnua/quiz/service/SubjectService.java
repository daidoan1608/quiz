package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.SubjectDto;
import com.fita.vnua.quiz.model.dto.SubjectSummaryDto;
import com.fita.vnua.quiz.model.dto.result.OperationResult;

import java.util.List;
import java.util.UUID;

public interface SubjectService {
    List<SubjectSummaryDto> getAllSubject();

    List<SubjectSummaryDto> getRandomSubjects(int limit);

    List<SubjectSummaryDto> getDeletedSubjects();

    List<SubjectSummaryDto> searchSubjects(String keyword);

    List<SubjectSummaryDto> filterSubjects(String keyword, Long categoryId, Boolean deleted, String sortBy, String sortDir);

    List<SubjectSummaryDto> getSubjectsByCategoryId(Long categoryId);

    SubjectDto getSubjectById(Long subjectId);

    SubjectDto create(SubjectDto subjectDto);

    SubjectDto update(Long subjectId, SubjectDto subjectDto);

    OperationResult delete(Long subjectId);

    SubjectDto restore(Long subjectId);

    List<SubjectSummaryDto> getSubjectsByUser(UUID userId);

}
