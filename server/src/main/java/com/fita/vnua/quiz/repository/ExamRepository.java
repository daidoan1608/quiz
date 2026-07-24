package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.Exam;
import com.fita.vnua.quiz.model.entity.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    Exam findExamByExamId(Long examId);

    @Query("SELECT e FROM Exam e JOIN FETCH e.subject JOIN FETCH e.createdBy WHERE e.deleted = false")
    List<Exam> findByDeletedFalse();

    @Query("SELECT e FROM Exam e JOIN FETCH e.subject JOIN FETCH e.createdBy WHERE e.deleted = true")
    List<Exam> findByDeletedTrue();

    long countByDeletedFalse();

    @Query("""
            SELECT e FROM Exam e
            JOIN FETCH e.subject
            WHERE e.examId = :examId
            AND e.deleted = false
            """)
    Optional<Exam> findByExamIdAndDeletedFalse(@Param("examId") Long examId);

    boolean existsByExamCodeIgnoreCase(String examCode);

    boolean existsByExamCodeIgnoreCaseAndExamIdNot(String examCode, Long examId);

    @Query("""
            SELECT e FROM Exam e
            JOIN FETCH e.subject s
            JOIN FETCH e.createdBy cb
            WHERE (:deleted IS NULL OR e.deleted = :deleted)
            AND (:subjectId IS NULL OR s.subjectId = :subjectId)
            AND (:categoryId IS NULL OR s.category.categoryId = :categoryId)
            AND (:createdBy IS NULL OR cb.userId = :createdBy)
            AND (
                :keyword IS NULL OR :keyword = ''
                OR LOWER(e.examCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR CAST(e.examId AS string) LIKE CONCAT('%', :keyword, '%')
            )
            """)
    List<Exam> filterExams(
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("subjectId") Long subjectId,
            @Param("createdBy") java.util.UUID createdBy,
            @Param("deleted") Boolean deleted
    );

    @Query(
            value = """
            SELECT e FROM Exam e
            JOIN FETCH e.subject s
            JOIN FETCH e.createdBy cb
            WHERE (:deleted IS NULL OR e.deleted = :deleted)
            AND (:subjectId IS NULL OR s.subjectId = :subjectId)
            AND (:categoryId IS NULL OR s.category.categoryId = :categoryId)
            AND (:createdBy IS NULL OR cb.userId = :createdBy)
            AND (
                :keyword IS NULL OR :keyword = ''
                OR LOWER(e.examCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR CAST(e.examId AS string) LIKE CONCAT('%', :keyword, '%')
            )
            """,
            countQuery = """
            SELECT COUNT(e) FROM Exam e
            JOIN e.subject s
            JOIN e.createdBy cb
            WHERE (:deleted IS NULL OR e.deleted = :deleted)
            AND (:subjectId IS NULL OR s.subjectId = :subjectId)
            AND (:categoryId IS NULL OR s.category.categoryId = :categoryId)
            AND (:createdBy IS NULL OR cb.userId = :createdBy)
            AND (
                :keyword IS NULL OR :keyword = ''
                OR LOWER(e.examCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR CAST(e.examId AS string) LIKE CONCAT('%', :keyword, '%')
            )
            """
    )
    Page<Exam> filterExamsPage(
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("subjectId") Long subjectId,
            @Param("createdBy") java.util.UUID createdBy,
            @Param("deleted") Boolean deleted,
            Pageable pageable
    );

    @Query("SELECT e FROM Exam e JOIN FETCH e.subject JOIN FETCH e.createdBy WHERE e.subject.subjectId = :subjectId AND e.deleted = false")
    List<Exam> findExamsBySubjectId(Long subjectId);

    @Query("""
            SELECT e FROM Exam e
            JOIN FETCH e.subject
            WHERE e.subject.subjectId = :subjectId
            AND e.deleted = true
            AND e.deletedCascadeId = :cascadeId
            """)
    List<Exam> findDeletedBySubjectIdAndCascadeId(
            @Param("subjectId") Long subjectId,
            @Param("cascadeId") java.util.UUID cascadeId
    );

    @Query("""
            SELECT e.subject.subjectId, COUNT(e)
            FROM Exam e
            WHERE e.subject.subjectId IN :subjectIds
            AND e.deleted = false
            GROUP BY e.subject.subjectId
            """)
    List<Object[]> countActiveExamsBySubjectIds(@Param("subjectIds") List<Long> subjectIds);

    @Query("""
            SELECT eq.exam.examId, COUNT(eq)
            FROM ExamQuestion eq
            WHERE eq.exam.examId IN :examIds
            GROUP BY eq.exam.examId
            """)
    List<Object[]> countQuestionsByExamIds(@Param("examIds") List<Long> examIds);

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
