package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByDeletedFalse();

    List<Question> findByDeletedTrue();

    Optional<Question> findByQuestionIdAndDeletedFalse(Long questionId);

    List<Question> findByContentContainingIgnoreCaseAndDeletedFalse(String content);

    default List<Question> findByContentContainingIgnoreCase(String content) {
        return findByContentContainingIgnoreCaseAndDeletedFalse(content);
    }

    @Query("SELECT q FROM Question q WHERE q.chapter.chapterId = :chapterId AND q.deleted = false")
    List<Question> findByChapter(@Param("chapterId") Long chapterId);

    @Query("SELECT q FROM Question q JOIN q.chapter c JOIN c.subject s WHERE s.subjectId = :subjectId AND q.deleted = false")
    List<Question> findQuestionsBySubjectId(@Param("subjectId") Long subjectId);

    @Query(value = "SELECT q.* FROM question q " +
            "JOIN chapter c ON q.chapter_id = c.chapter_id " +
            "WHERE c.subject_id = :subjectId " +
            "AND q.deleted = false " +
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
            "AND q.deleted = false " +
            "ORDER BY RAND() " +
            "LIMIT :number", nativeQuery = true)
    List<Question> findQuestionsByChapter(
            @Param("chapterId") Long chapterId,
            @Param("number") int number);

    // Lấy ngẫu nhiên số lượng câu hỏi theo subjectId
    @Query(value = "SELECT q.* FROM question q " +
            "JOIN chapter c ON q.chapter_id = c.chapter_id " +
            "WHERE c.subject_id = :subjectId " +
            "AND q.deleted = false " +
            "ORDER BY RAND() LIMIT :number", nativeQuery = true)
    List<Question> findRandomQuestionsBySubject(
            @Param("subjectId") Long subjectId,
            @Param("number") int number);

    @Query(value = "SELECT q.* FROM question q JOIN exam_question eq ON q.question_id = eq.question_id WHERE eq.exam_id = :examId", nativeQuery = true)
    List<Question> findQuestionsByExamId(Long examId);

    long countByDifficultyAndDeletedFalse(Question.Difficulty difficulty);

    default long countByDifficulty(Question.Difficulty difficulty) {
        return countByDifficultyAndDeletedFalse(difficulty);
    }

    @Query("SELECT q.chapter.subject.subjectId FROM Question q WHERE q.questionId = :questionId")
    Optional<Long> findSubjectIdByQuestionId(@Param("questionId") Long questionId);

    int countByChapterAndDeletedFalse(Chapter chapter);

    default int countByChapter(Chapter chapter) {
        return countByChapterAndDeletedFalse(chapter);
    }

    long countByChapterAndDifficultyAndDeletedFalse(Chapter chapter, Question.Difficulty difficulty);

    default long countByChapterAndDifficulty(Chapter chapter, Question.Difficulty difficulty) {
        return countByChapterAndDifficultyAndDeletedFalse(chapter, difficulty);
    }

    @Query("SELECT q.chapter.chapterId, q.difficulty, COUNT(q) " +
           "FROM Question q " +
           "WHERE q.chapter.subject.subjectId = :subjectId " +
           "AND q.deleted = false " +
           "GROUP BY q.chapter.chapterId, q.difficulty")
    List<Object[]> countQuestionsBySubjectGroupedByChapterAndDifficulty(@Param("subjectId") Long subjectId);
}
