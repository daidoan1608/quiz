package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.SubjectDto;
import com.fita.vnua.quiz.model.dto.SubjectSummaryDto;
import com.fita.vnua.quiz.model.dto.response.Response;

import java.util.List;
import java.util.UUID;

public interface SubjectService {
    List<SubjectSummaryDto> getAllSubject();

    List<SubjectSummaryDto> searchSubjects(String keyword);

    List<SubjectSummaryDto> getSubjectsByCategoryId(Long categoryId);

    SubjectDto getSubjectById(Long subjectId);

    SubjectDto create(SubjectDto subjectDto);

    SubjectDto update(Long subjectId, SubjectDto subjectDto);

    Response delete(Long subjectId);

    List<SubjectSummaryDto> getSubjectsByUser(UUID userId);

}
