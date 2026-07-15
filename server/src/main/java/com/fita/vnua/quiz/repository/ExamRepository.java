package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.Exam;
import com.fita.vnua.quiz.model.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    Exam findExamByExamId(Long examId);

    List<Exam> findByDeletedFalse();

    List<Exam> findByDeletedTrue();

    long countByDeletedFalse();

    Optional<Exam> findByExamIdAndDeletedFalse(Long examId);

    @Query("SELECT e FROM Exam e WHERE e.subject.subjectId = :subjectId AND e.deleted = false")
    List<Exam> findExamsBySubjectId(Long subjectId);

    @Query("SELECT e.subject.subjectId FROM Exam e WHERE e.examId = :examId")
    Optional<Long> findSubjectIdByExamId(@Param("examId") Long examId);

    @Query("""
            SELECT e.subject.subjectId FROM Exam e
            WHERE e.examId = :examId
            AND e.deleted = false
            AND e.subject.deleted = false
            """)
    Optional<Long> findActiveSubjectIdByExamId(@Param("examId") Long examId);

    long countBySubjectAndDeletedFalse(Subject subject);

    default long countBySubject(Subject subject) {
        return countBySubjectAndDeletedFalse(subject);
    }

    Long countByExamId(Long examId);
}
