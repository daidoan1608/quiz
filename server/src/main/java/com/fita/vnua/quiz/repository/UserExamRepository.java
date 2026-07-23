package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.dto.UserExamSummaryDto;
import com.fita.vnua.quiz.model.entity.UserExam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface UserExamRepository extends JpaRepository<UserExam, Long> {

    @Query("""
            SELECT ue FROM UserExam ue
            JOIN FETCH ue.exam e
            JOIN FETCH e.subject
            JOIN FETCH ue.user
            """)
    List<UserExam> findAllWithExamSubjectAndUser();

    @Query("""
            SELECT ue FROM UserExam ue
            JOIN FETCH ue.exam e
            JOIN FETCH e.subject
            JOIN FETCH ue.user
            WHERE ue.userExamId = :userExamId
            """)
    Optional<UserExam> findByIdWithExamSubjectAndUser(@Param("userExamId") Long userExamId);

    @Query("""
            SELECT ue FROM UserExam ue
            JOIN FETCH ue.exam e
            JOIN FETCH e.subject
            JOIN FETCH ue.user
            WHERE ue.user.userId = :userId
            """)
    List<UserExam> findUserExamsByUserId(UUID userId);

    @Query(
            value = """
            SELECT ue FROM UserExam ue
            JOIN FETCH ue.exam e
            JOIN FETCH e.subject s
            JOIN FETCH s.category c
            JOIN FETCH ue.user u
            WHERE (:categoryId IS NULL OR c.categoryId = :categoryId)
              AND (:subjectId IS NULL OR s.subjectId = :subjectId)
              AND (:startedFrom IS NULL OR ue.startTime >= :startedFrom)
              AND (:startedTo IS NULL OR ue.startTime <= :startedTo)
              AND (
                :keyword IS NULL OR :keyword = ''
                OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR CAST(ue.userExamId AS string) LIKE CONCAT('%', :keyword, '%')
              )
            """,
            countQuery = """
            SELECT COUNT(ue) FROM UserExam ue
            JOIN ue.exam e
            JOIN e.subject s
            JOIN s.category c
            JOIN ue.user u
            WHERE (:categoryId IS NULL OR c.categoryId = :categoryId)
              AND (:subjectId IS NULL OR s.subjectId = :subjectId)
              AND (:startedFrom IS NULL OR ue.startTime >= :startedFrom)
              AND (:startedTo IS NULL OR ue.startTime <= :startedTo)
              AND (
                :keyword IS NULL OR :keyword = ''
                OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR CAST(ue.userExamId AS string) LIKE CONCAT('%', :keyword, '%')
              )
            """
    )
    Page<UserExam> filterForAdmin(
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("subjectId") Long subjectId,
            @Param("startedFrom") LocalDateTime startedFrom,
            @Param("startedTo") LocalDateTime startedTo,
            Pageable pageable
    );

    @Query("""
            SELECT ue FROM UserExam ue
            JOIN FETCH ue.exam e
            JOIN FETCH e.subject
            JOIN FETCH ue.user
            WHERE ue.userExamId = :userExamId
            AND ue.user.userId = :userId
            """)
    Optional<UserExam> findByIdAndUserId(@Param("userExamId") Long userExamId, @Param("userId") UUID userId);

    @Query("SELECT ue.exam.subject.subjectId FROM UserExam ue WHERE ue.userExamId = :userExamId")
    Optional<Long> findSubjectIdByUserExamId(@Param("userExamId") Long userExamId);

    @Query("""
            SELECT ue FROM UserExam ue
            JOIN FETCH ue.exam e
            JOIN FETCH e.subject
            JOIN FETCH ue.user
            WHERE ue.user.userId = :userId
            AND ue.exam.examId = :examId
            AND ue.status = 'IN_PROGRESS'
            ORDER BY ue.updatedAt DESC
            """)
    List<UserExam> findInProgressByUserIdAndExamId(@Param("userId") UUID userId, @Param("examId") Long examId);

    @Query("""
            SELECT ue FROM UserExam ue
            JOIN FETCH ue.exam e
            JOIN FETCH e.subject
            JOIN FETCH ue.user
            WHERE ue.user.userId = :userId
            AND ue.status = 'IN_PROGRESS'
            ORDER BY ue.updatedAt DESC
            """)
    List<UserExam> findInProgressByUserId(@Param("userId") UUID userId);

    @Query("SELECT ue.exam.examId AS examId, COUNT(ue) AS attempts " +
            "FROM UserExam ue " +
            "WHERE ue.user.userId = :userId " +
            "GROUP BY ue.exam.examId")
    List<Map<Long, Object>> countExamsByUserId(@Param("userId") UUID userId);

    @Query(value = """
        SELECT
            u.user_id as userId,
            u.username as username,
            u.avatar_url as avatarUrl,
            COUNT(ue.user_exam_id) as attemptCount,
            AVG(ue.score) as avgScore,
            SUM(ue.score) as totalScore,
            SUM(TIMESTAMPDIFF(SECOND, ue.start_time, ue.end_time)) as totalDurationSeconds,
            GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as subjects
        FROM user_exam ue
        JOIN user u ON ue.user_id = u.user_id
        JOIN exam e ON ue.exam_id = e.exam_id
        JOIN subject s ON e.subject_id = s.subject_id
        WHERE (:fromDate IS NULL OR ue.start_time >= :fromDate)
          AND (:toDate IS NULL OR ue.start_time < :toDate)
        GROUP BY u.user_id, u.username, u.avatar_url
        """, nativeQuery = true)
    List<UserExamSummaryProjection> getUserExamSummaries(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );

    @Query(value = """
        WITH summaries AS (
            SELECT
                u.user_id as userId,
                u.username as username,
                u.avatar_url as avatarUrl,
                COUNT(ue.user_exam_id) as attemptCount,
                AVG(ue.score) as avgScore,
                SUM(ue.score) as totalScore,
                SUM(TIMESTAMPDIFF(SECOND, ue.start_time, ue.end_time)) as totalDurationSeconds,
                GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as subjects
            FROM user_exam ue
            JOIN user u ON ue.user_id = u.user_id
            JOIN exam e ON ue.exam_id = e.exam_id
            JOIN subject s ON e.subject_id = s.subject_id
            WHERE ue.score IS NOT NULL
              AND (:fromDate IS NULL OR ue.start_time >= :fromDate)
              AND (:toDate IS NULL OR ue.start_time < :toDate)
              AND (:subjectName IS NULL OR s.name = :subjectName)
            GROUP BY u.user_id, u.username, u.avatar_url
        ),
        ranked AS (
            SELECT
                summaries.*,
                ROW_NUMBER() OVER (
                    ORDER BY
                        CASE WHEN :criteria = 'avg' THEN summaries.avgScore ELSE summaries.totalScore END DESC,
                        summaries.totalDurationSeconds ASC,
                        summaries.username ASC
                ) as rankPosition
            FROM summaries
        )
        SELECT * FROM ranked
        WHERE rankPosition <= :limit
        ORDER BY rankPosition
        """, nativeQuery = true)
    List<UserExamSummaryProjection> getTopRankings(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("subjectName") String subjectName,
            @Param("criteria") String criteria,
            @Param("limit") int limit
    );

    @Query(value = """
        WITH summaries AS (
            SELECT
                u.user_id as userId,
                u.username as username,
                u.avatar_url as avatarUrl,
                COUNT(ue.user_exam_id) as attemptCount,
                AVG(ue.score) as avgScore,
                SUM(ue.score) as totalScore,
                SUM(TIMESTAMPDIFF(SECOND, ue.start_time, ue.end_time)) as totalDurationSeconds,
                GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as subjects
            FROM user_exam ue
            JOIN user u ON ue.user_id = u.user_id
            JOIN exam e ON ue.exam_id = e.exam_id
            JOIN subject s ON e.subject_id = s.subject_id
            WHERE ue.score IS NOT NULL
              AND (:fromDate IS NULL OR ue.start_time >= :fromDate)
              AND (:toDate IS NULL OR ue.start_time < :toDate)
              AND (:subjectName IS NULL OR s.name = :subjectName)
            GROUP BY u.user_id, u.username, u.avatar_url
        ),
        ranked AS (
            SELECT
                summaries.*,
                ROW_NUMBER() OVER (
                    ORDER BY
                        CASE WHEN :criteria = 'avg' THEN summaries.avgScore ELSE summaries.totalScore END DESC,
                        summaries.totalDurationSeconds ASC,
                        summaries.username ASC
                ) as rankPosition
            FROM summaries
        )
        SELECT * FROM ranked
        WHERE userId = :userId
        """, nativeQuery = true)
    Optional<UserExamSummaryProjection> getUserRanking(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("subjectName") String subjectName,
            @Param("criteria") String criteria,
            @Param("userId") byte[] userId
    );

    public interface UserExamSummaryProjection {
        byte[] getUserId();
        String getUsername();
        String getAvatarUrl();
        Long getAttemptCount();
        Double getAvgScore();
        Double getTotalScore();
        Long getTotalDurationSeconds();
        String getSubjects();
        Long getRankPosition();
    }

    @Query("""
            SELECT ue FROM UserExam ue
            JOIN FETCH ue.exam e
            JOIN FETCH e.subject s
            JOIN FETCH ue.user
            WHERE ue.user.userId = :userId
            AND s.subjectId = :subjectId
            ORDER BY ue.startTime DESC
            """)
    List<UserExam> findUserExamsByUserIdAndSubjectId(
            @Param("userId") UUID userId,
            @Param("subjectId") Long subjectId
    );

    @EntityGraph(attributePaths = {"exam", "exam.subject", "user"})
    @Query("""
            SELECT ue FROM UserExam ue
            WHERE ue.user.userId = :userId
            ORDER BY ue.endTime DESC
            """)
    List<UserExam> findLast7ExamsByUser(@Param("userId") UUID userId, Pageable pageable);

    @Modifying
    @Transactional
    @Query("DELETE FROM UserExam ue WHERE ue.exam.examId = :examId")
    void deleteByExamId(@Param("examId") Long examId);

    @Query("""
            SELECT FUNCTION('DATE', ue.startTime), COUNT(ue)
            FROM UserExam ue
            WHERE ue.startTime >= :fromDate
            GROUP BY FUNCTION('DATE', ue.startTime)
            ORDER BY FUNCTION('DATE', ue.startTime)
            """)
    List<Object[]> countAttemptsByDay(@Param("fromDate") LocalDateTime fromDate);

    @Query("""
            SELECT ue.exam.subject.name, COUNT(ue)
            FROM UserExam ue
            GROUP BY ue.exam.subject.subjectId, ue.exam.subject.name
            ORDER BY COUNT(ue) DESC
            """)
    List<Object[]> countAttemptsBySubject();

    @Query("""
            SELECT ue.user.userId, ue.user.username, ue.user.fullName, COUNT(ue), MAX(ue.startTime)
            FROM UserExam ue
            GROUP BY ue.user.userId, ue.user.username, ue.user.fullName
            ORDER BY COUNT(ue) DESC, MAX(ue.startTime) DESC
            """)
    List<Object[]> findActiveUsersByAttemptCount();
}
