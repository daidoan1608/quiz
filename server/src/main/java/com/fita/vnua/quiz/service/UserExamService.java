package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.UserExamDto;
import com.fita.vnua.quiz.model.dto.UserExamSummaryDto;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.model.dto.request.SaveExamAttemptAnswerRequest;
import com.fita.vnua.quiz.model.dto.request.StartExamAttemptRequest;
import com.fita.vnua.quiz.model.dto.request.UpdateExamAttemptProgressRequest;
import com.fita.vnua.quiz.model.dto.request.UserExamRequest;
import com.fita.vnua.quiz.model.dto.response.ExamAttemptResponse;
import com.fita.vnua.quiz.model.dto.response.RankingResponse;
import com.fita.vnua.quiz.model.dto.response.UserExamResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface UserExamService {
    List<UserExamSummaryDto> getUserExamSummaries(LocalDateTime fromDate, LocalDateTime toDate);

    RankingResponse getRankings(LocalDateTime fromDate, LocalDateTime toDate, String subjectName, String criteria, int limit, UUID currentUserId);

    UserExamResponse getUserExamByIdForUser(Long id, UUID currentUserId);

    UserExamResponse getUserExamByIdForAdmin(Long id);

    UserExamDto createUserExam(UserExamRequest userExamRequest, UUID currentUserId);

    List<UserExamResponse> getUserExamByUserId(UUID userId);

    List<Map<Long, Object>> getExamAttemptsByUserId(UUID userId);

    Page<UserExamResponse> getAllUserExamsForAdmin(
            String keyword,
            Long categoryId,
            Long subjectId,
            LocalDateTime startedFrom,
            LocalDateTime startedTo,
            Pageable pageable
    );

    List<UserExamResponse> getExamsByUserAndSubject(UUID userId, Long subjectId);

    List<UserExamResponse> getLast7ExamsByUser(UUID userId);

    ExamAttemptResponse startOrResumeAttempt(StartExamAttemptRequest request, UUID currentUserId);

    List<ExamAttemptResponse> getInProgressAttempts(UUID userId);

    ExamAttemptResponse saveAttemptAnswer(Long userExamId, SaveExamAttemptAnswerRequest request, UUID currentUserId);

    ExamAttemptResponse updateAttemptProgress(Long userExamId, UpdateExamAttemptProgressRequest request, UUID currentUserId);

    UserExamDto submitAttempt(Long userExamId, UUID currentUserId);

    List<Question> getAttemptQuestionsForSubmittedAttempt(Long userExamId, UUID currentUserId);

    List<QuestionDto> getAttemptQuestionDtosForSubmittedAttempt(Long userExamId, UUID currentUserId);
}
