package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    @Query("SELECT q FROM Question q WHERE q.chapter.chapterId = :chapterId")
    List<Question> findByChapter(@Param("chapterId") Long chapterId);

    @Query("SELECT q FROM Question q JOIN q.chapter c JOIN c.subject s WHERE s.subjectId = :subjectId")
    List<Question> findQuestionsBySubjectId(@Param("subjectId") Long subjectId);

    @Query(value = "SELECT q.* FROM question q " +
            "JOIN chapter c ON q.chapter_id = c.chapter_id " +
            "WHERE c.subject_id = :subjectId " +
            "AND (:difficulty IS NULL OR q.difficulty = :difficulty) " +
            "ORDER BY RAND() " +
            "LIMIT :number", nativeQuery = true)
    List<Question> findQuestionsBySubjectAndDifficulty(
            @Param("subjectId") Long subjectId,
            @Param("difficulty") String difficulty,
            @Param("number") int number);

    @Query(value = "SELECT q.* FROM question q " +
            "JOIN chapter c ON q.chapter_id = c.chapter_id " +
            "WHERE c.chapter_id = :chapterId " +
            "ORDER BY RAND() " +
            "LIMIT :number", nativeQuery = true)
    List<Question> findQuestionsByChapter(
            @Param("chapterId") Long chapterId,
            @Param("number") int number);

    // Lấy ngẫu nhiên số lượng câu hỏi theo subjectId
    @Query(value = "SELECT q.* FROM question q " +
            "JOIN Chapter c ON q.chapter_id = c.chapter_id " +
            "WHERE c.subject_id = :subjectId " +
            "ORDER BY RAND() LIMIT :number", nativeQuery = true)
    List<Question> findRandomQuestionsBySubject(
            @Param("subjectId") Long subjectId,
            @Param("number") int number);

    @Query(value = "SELECT q.* FROM question q JOIN exam_question eq ON q.question_id = eq.question_id WHERE eq.exam_id = :examId", nativeQuery = true)
    List<Question> findQuestionsByExamId(Long examId);

    long countByDifficulty(Question.Difficulty difficulty);

    @Query("SELECT q.chapter.subject.subjectId FROM Question q WHERE q.questionId = :questionId")
    Optional<Long> findSubjectIdByQuestionId(@Param("questionId") Long questionId);

    int countByChapter(Chapter chapter);

    long countByChapterAndDifficulty(Chapter chapter, Question.Difficulty difficulty);
}
