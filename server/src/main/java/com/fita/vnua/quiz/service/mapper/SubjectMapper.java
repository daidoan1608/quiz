package com.fita.vnua.quiz.service.mapper;

import com.fita.vnua.quiz.model.dto.ExamInfo;
import com.fita.vnua.quiz.model.dto.SubjectDto;
import com.fita.vnua.quiz.model.dto.SubjectSummaryDto;
import com.fita.vnua.quiz.model.entity.Exam;
import com.fita.vnua.quiz.model.entity.Subject;
import org.springframework.stereotype.Component;

@Component
public class SubjectMapper {

    public SubjectSummaryDto toSummaryDto(
            Subject subject,
            Long chapterCount,
            Long examCount,
            Long questionCount
    ) {
        SubjectSummaryDto dto = new SubjectSummaryDto();
        dto.setSubjectId(subject.getSubjectId());
        dto.setCategoryId(subject.getCategory() == null ? null : subject.getCategory().getCategoryId());
        dto.setName(subject.getName());
        dto.setDescription(subject.getDescription());
        dto.setTotalChapters(chapterCount == null ? 0L : chapterCount);
        dto.setTotalExams(examCount == null ? 0L : examCount);
        dto.setTotalQuestions(questionCount == null ? 0L : questionCount);
        dto.setDeleted(subject.getDeleted());
        dto.setDeletedAt(subject.getDeletedAt());
        dto.setDeletedBy(subject.getDeletedBy());
        dto.setDeletedCascadeId(subject.getDeletedCascadeId());
        dto.setDeleteOriginType(subject.getDeleteOriginType());
        dto.setDeleteOriginId(subject.getDeleteOriginId());
        return dto;
    }

    public SubjectDto toDto(Subject subject) {
        SubjectDto dto = new SubjectDto();
        dto.setSubjectId(subject.getSubjectId());
        dto.setCategoryId(subject.getCategory() == null ? null : subject.getCategory().getCategoryId());
        dto.setName(subject.getName());
        dto.setDescription(subject.getDescription());
        dto.setDeleted(subject.getDeleted());
        dto.setDeletedAt(subject.getDeletedAt());
        dto.setDeletedBy(subject.getDeletedBy());
        dto.setDeletedCascadeId(subject.getDeletedCascadeId());
        dto.setDeleteOriginType(subject.getDeleteOriginType());
        dto.setDeleteOriginId(subject.getDeleteOriginId());
        return dto;
    }

    public ExamInfo toExamInfo(Exam exam, Long totalQuestions) {
        ExamInfo dto = new ExamInfo();
        dto.setExamId(exam.getExamId());
        dto.setExamCode(exam.getExamCode());
        dto.setTitle(exam.getTitle());
        dto.setDescription(exam.getDescription());
        dto.setDuration(exam.getDuration());
        dto.setTotalQuestions(totalQuestions == null ? 0L : totalQuestions);
        return dto;
    }
}
