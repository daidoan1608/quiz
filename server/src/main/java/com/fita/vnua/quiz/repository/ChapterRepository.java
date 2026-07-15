package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findByDeletedFalse();

    List<Chapter> findByDeletedTrue();

    long countByDeletedFalse();

    List<Chapter> findByNameContainingIgnoreCaseAndDeletedFalse(String name);

    @Query("SELECT c FROM Chapter c WHERE c.subject.subjectId = :subjectId AND c.deleted = false")
    List<Chapter> findBySubject(Long subjectId);

    @Query("SELECT c FROM Chapter c WHERE c.subject.subjectId = :subjectId")
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

    default long countChapterBySubject(Subject subject) {
        return countChapterBySubjectAndDeletedFalse(subject);
    }
}
