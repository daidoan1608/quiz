package com.fita.vnua.quiz.service.mapper;

import com.fita.vnua.quiz.model.dto.ExamDto;
import com.fita.vnua.quiz.model.dto.ExamSummaryDto;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.entity.Exam;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ExamMapper {

    public ExamSummaryDto toSummaryDto(Exam exam, Long questionCount) {
        ExamSummaryDto dto = new ExamSummaryDto();
        dto.setExamId(exam.getExamId());
        dto.setExamCode(exam.getExamCode());
        dto.setTitle(exam.getTitle());
        dto.setDescription(exam.getDescription());
        dto.setDuration(exam.getDuration());
        dto.setSubjectId(exam.getSubject() == null ? null : exam.getSubject().getSubjectId());
        dto.setSubjectName(exam.getSubject() == null ? null : exam.getSubject().getName());
        dto.setCreatedBy(exam.getCreatedBy() == null ? null : exam.getCreatedBy().getUserId());
        dto.setCreatedDate(String.valueOf(exam.getCreatedTime()));
        dto.setQuestionCount(questionCount == null ? 0 : questionCount.intValue());
        dto.setDeleted(exam.getDeleted());
        dto.setDeletedAt(exam.getDeletedAt());
        dto.setDeletedBy(exam.getDeletedBy());
        dto.setDeletedCascadeId(exam.getDeletedCascadeId());
        dto.setDeleteOriginType(exam.getDeleteOriginType());
        dto.setDeleteOriginId(exam.getDeleteOriginId());
        return dto;
    }

    public ExamDto toDto(Exam exam) {
        return toDto(exam, null);
    }

    public ExamDto toDto(Exam exam, List<QuestionDto> questions) {
        ExamDto dto = new ExamDto();
        dto.setExamId(exam.getExamId());
        dto.setExamCode(exam.getExamCode());
        dto.setTitle(exam.getTitle());
        dto.setDescription(exam.getDescription());
        dto.setDuration(exam.getDuration());
        dto.setSubjectId(exam.getSubject() == null ? null : exam.getSubject().getSubjectId());
        dto.setSubjectName(exam.getSubject() == null ? null : exam.getSubject().getName());
        dto.setCreatedBy(exam.getCreatedBy() == null ? null : exam.getCreatedBy().getUserId());
        dto.setCreatedDate(String.valueOf(exam.getCreatedTime()));
        dto.setQuestions(questions);
        dto.setDeleted(exam.getDeleted());
        dto.setDeletedAt(exam.getDeletedAt());
        dto.setDeletedBy(exam.getDeletedBy());
        dto.setDeletedCascadeId(exam.getDeletedCascadeId());
        dto.setDeleteOriginType(exam.getDeleteOriginType());
        dto.setDeleteOriginId(exam.getDeleteOriginId());
        return dto;
    }
}
