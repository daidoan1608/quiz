package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    @Query("SELECT q FROM Question q WHERE q.chapter.id = :chapterId")
    List<Question> findByChapter(@Param("chapterId") Long chapterId);

    @Query("SELECT q FROM Question q JOIN q.chapter c JOIN c.subject s WHERE s.subjectId = :subjectId")
    List<Question> findQuestionsBySubjectId(@Param("subjectId") Long subjectId);

//    @Query("SELECT q FROM Question q WHERE q.subject.subjectId = :subjectId AND (:difficulty IS NULL OR q.difficulty = :difficulty)")
//    List<Question> findQuestionsBySubjectAndDifficulty(
//            @Param("subjectId") Long subjectId,
//            @Param("difficulty") String difficulty
//    );

    @Query(value = "SELECT * FROM Question ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomQuestions(@Param("limit") int limit);

    // Lấy ngẫu nhiên số lượng câu hỏi theo subjectId
    @Query(value = "SELECT q.* FROM Question q " +
            "JOIN Chapter c ON q.chapter_id = c.chapter_id " +
            "WHERE c.subject_id = :subjectId " +
            "ORDER BY RAND() LIMIT :number", nativeQuery = true)
    List<Question> findRandomQuestionsBySubject(@Param("subjectId") Long subjectId, @Param("number") int number);

    @Query(value = "SELECT q.* FROM Question q JOIN Exam_Question eq ON q.question_id = eq.question_id WHERE eq.exam_id = :examId", nativeQuery = true)
    List<Question> findQuestionsByExamId(Long examId);
}
