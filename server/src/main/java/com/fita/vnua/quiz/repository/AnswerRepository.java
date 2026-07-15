package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    @Query("SELECT a.question.chapter.subject.subjectId FROM Answer a WHERE a.optionId = :optionId")
    Optional<Long> findSubjectIdByAnswerId(@Param("optionId") Long optionId);

    @Query("""
            SELECT a.question.chapter.subject.subjectId FROM Answer a
            WHERE a.optionId = :optionId
            AND a.question.deleted = false
            AND a.question.chapter.deleted = false
            AND a.question.chapter.subject.deleted = false
            """)
    Optional<Long> findActiveSubjectIdByAnswerId(@Param("optionId") Long optionId);
}
