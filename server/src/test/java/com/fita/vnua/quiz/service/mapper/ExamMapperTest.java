package com.fita.vnua.quiz.service.mapper;

import com.fita.vnua.quiz.model.dto.ExamDto;
import com.fita.vnua.quiz.model.dto.ExamSummaryDto;
import com.fita.vnua.quiz.model.entity.Exam;
import com.fita.vnua.quiz.model.entity.Subject;
import com.fita.vnua.quiz.model.entity.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ExamMapperTest {
    private final ExamMapper examMapper = new ExamMapper();

    @Test
    void toSummaryDtoMapsExamFieldsAndQuestionCount() {
        Exam exam = buildExam();

        ExamSummaryDto dto = examMapper.toSummaryDto(exam, 12L);

        assertThat(dto.getExamId()).isEqualTo(99L);
        assertThat(dto.getSubjectId()).isEqualTo(7L);
        assertThat(dto.getSubjectName()).isEqualTo("Math");
        assertThat(dto.getCreatedBy()).isEqualTo(exam.getCreatedBy().getUserId());
        assertThat(dto.getQuestionCount()).isEqualTo(12);
        assertThat(dto.getDeleted()).isTrue();
        assertThat(dto.getDeleteOriginType()).isEqualTo("SUBJECT");
    }

    @Test
    void toDtoMapsQuestionsAndSoftDeleteMetadata() {
        Exam exam = buildExam();

        ExamDto dto = examMapper.toDto(exam, List.of());

        assertThat(dto.getExamId()).isEqualTo(99L);
        assertThat(dto.getSubjectName()).isEqualTo("Math");
        assertThat(dto.getQuestions()).isEmpty();
        assertThat(dto.getDeleted()).isTrue();
        assertThat(dto.getDeletedCascadeId()).isEqualTo(exam.getDeletedCascadeId());
    }

    private Exam buildExam() {
        Subject subject = new Subject();
        subject.setSubjectId(7L);
        subject.setName("Math");

        User creator = new User();
        creator.setUserId(UUID.randomUUID());

        Exam exam = new Exam();
        exam.setExamId(99L);
        exam.setExamCode("EXAM-001");
        exam.setTitle("Midterm");
        exam.setDescription("Sample");
        exam.setDuration(45);
        exam.setSubject(subject);
        exam.setCreatedBy(creator);
        exam.setCreatedTime(LocalDate.of(2026, 7, 23));
        exam.setDeleted(true);
        exam.setDeletedAt(LocalDateTime.of(2026, 7, 23, 10, 0));
        exam.setDeletedBy(UUID.randomUUID());
        exam.setDeletedCascadeId(UUID.randomUUID());
        exam.setDeleteOriginType("SUBJECT");
        exam.setDeleteOriginId(7L);
        return exam;
    }
}
