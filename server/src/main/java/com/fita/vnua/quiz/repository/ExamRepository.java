package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    Exam findExamByExamId(Long examId);

    @Query("SELECT e FROM Exam e WHERE e.subject.subjectId = :subjectId")
    List<Exam> findExamsBySubjectId(Long subjectId);
}
