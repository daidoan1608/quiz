package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    @Query("SELECT c FROM Chapter c JOIN FETCH c.subject WHERE c.deleted = false")
    List<Chapter> findByDeletedFalse();

    @Query("SELECT c FROM Chapter c JOIN FETCH c.subject WHERE c.deleted = true")
    List<Chapter> findByDeletedTrue();

    long countByDeletedFalse();

    @Query("""
            SELECT c FROM Chapter c
            JOIN FETCH c.subject
            WHERE c.deleted = false
            AND LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))
            """)
    List<Chapter> findByNameContainingIgnoreCaseAndDeletedFalse(@Param("name") String name);

    @Query("""
            SELECT c FROM Chapter c
            JOIN FETCH c.subject s
            WHERE (:deleted IS NULL OR c.deleted = :deleted)
            AND (:subjectId IS NULL OR s.subjectId = :subjectId)
            AND (:categoryId IS NULL OR s.category.categoryId = :categoryId)
            AND (
                :keyword IS NULL OR :keyword = ''
                OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR CAST(c.chapterId AS string) LIKE CONCAT('%', :keyword, '%')
                OR CAST(c.chapterNumber AS string) LIKE CONCAT('%', :keyword, '%')
            )
            """)
    List<Chapter> filterChapters(
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("subjectId") Long subjectId,
            @Param("deleted") Boolean deleted
    );

    @Query("SELECT c FROM Chapter c JOIN FETCH c.subject WHERE c.subject.subjectId = :subjectId AND c.deleted = false")
    List<Chapter> findBySubject(Long subjectId);

    @Query("SELECT c FROM Chapter c JOIN FETCH c.subject WHERE c.subject.subjectId = :subjectId")
    List<Chapter> findBySubjectIncludingDeleted(Long subjectId);

    @Query("SELECT c.subject.subjectId FROM Chapter c WHERE c.chapterId = :chapterId")
    Optional<Long> findSubjectIdByChapterId(@Param("chapterId") Long chapterId);

    @Query("""
            SELECT c.subject.subjectId FROM Chapter c
            WHERE c.chapterId = :chapterId
            AND c.deleted = false
            AND c.subject.deleted = false
            """)
    Optional<Long> findActiveSubjectIdByChapterId(@Param("chapterId") Long chapterId);

    long countChapterBySubjectAndDeletedFalse(Subject subject);

    @Query("""
            SELECT c.subject.subjectId, COUNT(c)
            FROM Chapter c
            WHERE c.subject.subjectId IN :subjectIds
            AND c.deleted = false
            GROUP BY c.subject.subjectId
            """)
    List<Object[]> countActiveChaptersBySubjectIds(@Param("subjectIds") List<Long> subjectIds);

    default long countChapterBySubject(Subject subject) {
        return countChapterBySubjectAndDeletedFalse(subject);
    }
}
