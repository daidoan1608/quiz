package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.response.UserExamResponse;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.model.entity.UserAnswer;
import com.fita.vnua.quiz.model.entity.UserExam;
import com.fita.vnua.quiz.model.entity.UserExamQuestion;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.UserAnswerRepository;
import com.fita.vnua.quiz.repository.UserExamQuestionRepository;
import com.fita.vnua.quiz.repository.UserExamRepository;
import com.fita.vnua.quiz.service.UserExamAdminService;
import com.fita.vnua.quiz.service.mapper.UserExamMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserExamAdminServiceImpl implements UserExamAdminService {

    private final UserExamRepository userExamRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final UserExamQuestionRepository userExamQuestionRepository;
    private final QuestionRepository questionRepository;
    private final UserExamAttemptStatsService attemptStatsService;
    private final UserExamMapper userExamMapper;

    @Override
    public Page<UserExamResponse> getAllUserExamsForAdmin(
            String keyword,
            Long categoryId,
            Long subjectId,
            LocalDateTime startedFrom,
            LocalDateTime startedTo,
            Pageable pageable
    ) {
        String normalizedKeyword = keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();
        return userExamRepository.filterForAdmin(
                        normalizedKeyword,
                        categoryId,
                        subjectId,
                        startedFrom,
                        startedTo,
                        pageable
                )
                .map(userExamMapper::toAdminListResponse);
    }

    @Override
    public UserExamResponse getUserExamByIdForAdmin(Long id) {
        UserExam userExam = userExamRepository.findByIdWithExamSubjectAndUser(id)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy bài thi của người dùng", HttpStatus.NOT_FOUND));
        return buildUserExamResponse(userExam);
    }

    private UserExamResponse buildUserExamResponse(UserExam userExam) {
        List<UserAnswer> answers = userAnswerRepository.findUserAnswersByUserExamId(userExam.getUserExamId());
        return userExamMapper.toDetailResponse(
                userExam,
                attemptStatsService.loadAttemptStats(userExam),
                answers,
                getAttemptQuestionDtos(userExam)
        );
    }

    private List<QuestionDto> getAttemptQuestionDtos(UserExam userExam) {
        if (userExamQuestionRepository == null) {
            return userExamMapper.toQuestionDtos(getAttemptQuestions(userExam));
        }
        List<UserExamQuestion> snapshots = userExamQuestionRepository.findWithQuestionDetailsByUserExamIds(List.of(userExam.getUserExamId()));
        if (!snapshots.isEmpty() && snapshots.stream().allMatch(snapshot -> snapshot.getQuestionContentSnapshot() != null)) {
            return snapshots.stream()
                    .map(userExamMapper::toQuestionDto)
                    .toList();
        }
        return userExamMapper.toQuestionDtos(getAttemptQuestions(userExam));
    }

    private List<Question> getAttemptQuestions(UserExam userExam) {
        if (userExamQuestionRepository == null) {
            return getExamQuestionsIncludingDeleted(userExam.getExam().getExamId());
        }
        List<UserExamQuestion> snapshots = userExamQuestionRepository.findWithQuestionDetailsByUserExamIds(List.of(userExam.getUserExamId()));
        if (!snapshots.isEmpty()) {
            return snapshots.stream().map(UserExamQuestion::getQuestion).toList();
        }
        return getExamQuestionsIncludingDeleted(userExam.getExam().getExamId());
    }

    private List<Question> getExamQuestionsIncludingDeleted(Long examId) {
        List<Question> questions = questionRepository.findQuestionsByExamIdIncludingDeleted(examId);
        if (questions != null && !questions.isEmpty()) {
            return questions;
        }
        return questionRepository.findQuestionsByExamId(examId);
    }
}