package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    @Query("SELECT c FROM Chapter c WHERE c.subject.subjectId = :subjectId")
    List<Chapter> findBySubject(Long subjectId);

    @Query("SELECT c.subject.subjectId FROM Chapter c WHERE c.chapterId = :chapterId")
    Optional<Long> findSubjectIdByChapterId(@Param("chapterId") Long chapterId);
}
