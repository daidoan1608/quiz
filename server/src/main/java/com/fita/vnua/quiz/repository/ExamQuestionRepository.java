package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.genaretor.ExamQuestionId;
import com.fita.vnua.quiz.model.entity.Exam;
import com.fita.vnua.quiz.model.entity.ExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, ExamQuestionId> {
    Long countByExam(Exam exam);

    @Modifying
    @Transactional
    @Query("DELETE FROM ExamQuestion eq WHERE eq.exam.examId = :examId")
    void deleteByExamId(@Param("examId") Long examId);
}
