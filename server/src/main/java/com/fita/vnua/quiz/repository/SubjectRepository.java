package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.Category;
import com.fita.vnua.quiz.model.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    @Query("SELECT s FROM Subject s JOIN FETCH s.category WHERE s.deleted = false")
    List<Subject> findByDeletedFalse();

    @Query(value = """
            SELECT s.*
            FROM subject s
            WHERE s.deleted = false
            ORDER BY RAND()
            LIMIT :limit
            """, nativeQuery = true)
    List<Subject> findRandomActiveSubjects(@Param("limit") int limit);

    @Query("SELECT s FROM Subject s JOIN FETCH s.category WHERE s.deleted = true")
    List<Subject> findByDeletedTrue();

    long countByDeletedFalse();

    @Query("SELECT s FROM Subject s JOIN FETCH s.category WHERE s.category = :category AND s.deleted = false")
    List<Subject> findSubjectsByCategoryAndDeletedFalse(@Param("category") Category category);

    List<Subject> findSubjectsByCategoryAndDeletedTrue(Category category);

    @Query("""
            SELECT s FROM Subject s
            JOIN FETCH s.category c
            WHERE (:deleted IS NULL OR s.deleted = :deleted)
            AND (:categoryId IS NULL OR c.categoryId = :categoryId)
            AND (
                :keyword IS NULL OR :keyword = ''
                OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR CAST(s.subjectId AS string) LIKE CONCAT('%', :keyword, '%')
            )
            """)
    List<Subject> filterSubjects(
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("deleted") Boolean deleted
    );

    @Query("""
            SELECT s FROM Subject s
            JOIN FETCH s.category
            WHERE s.deleted = false
            AND (
                LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
            """)
    List<Subject> searchActive(@Param("keyword") String keyword);

    @Query("SELECT s.subjectId FROM Subject s WHERE s.subjectId = :subjectId AND s.deleted = false")
    Optional<Long> findActiveSubjectId(@Param("subjectId") Long subjectId);

    @Query(value = """
    SELECT
        s.*
    FROM user_exam ue
    JOIN exam e ON ue.exam_id = e.exam_id
    JOIN subject s ON e.subject_id = s.subject_id
    WHERE ue.user_id = :userId
    GROUP BY s.subject_id, s.name
    ORDER BY MAX(ue.end_time) DESC
    """, nativeQuery = true)
    List<Subject> findSubjectsWithUserExams(@Param("userId") UUID userId);
}
