package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.enums.QuestionDifficulty;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.model.entity.UserAnswer;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.UserAnswerRepository;
import com.fita.vnua.quiz.service.mapper.QuestionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionPracticeService {
    private final QuestionRepository questionRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final QuestionMapper questionMapper;
    private final QuestionDetailLoader questionDetailLoader;

    @Transactional(readOnly = true)
    public List<QuestionDto> getPracticeQuestionsByChapter(Long chapterId, Integer limit, String difficulty, String mode, UUID userId) {
        int safeLimit = normalizeLimit(limit, 50);
        String normalizedDifficulty = difficulty == null || difficulty.isBlank() || "ALL".equalsIgnoreCase(difficulty)
                ? null
                : questionMapper.parseDifficulty(difficulty).name();

        if ("wrong".equalsIgnoreCase(mode)) {
            requireUser(userId);
        }
        List<Question> questions = questionDetailLoader.loadInSameOrder(
                questionRepository.findPracticeQuestionsByChapterAndDifficulty(chapterId, normalizedDifficulty, safeLimit)
        );
        if ("wrong".equalsIgnoreCase(mode)) {
            Set<Long> wrongQuestionIds = findWrongQuestionIds(userId, chapterId);
            questions = questions.stream()
                    .filter(question -> wrongQuestionIds.contains(question.getQuestionId()))
                    .toList();
        }
        return questions.stream().map(questionMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<QuestionDto> getSmartWrongPracticeQuestions(Long subjectId, Long chapterId, Integer limit, String difficulty, String strategy, UUID userId) {
        requireUser(userId);
        int safeLimit = normalizeLimit(limit, 10);
        QuestionDifficulty normalizedDifficulty = difficulty == null || difficulty.isBlank() || "ALL".equalsIgnoreCase(difficulty)
                ? null
                : questionMapper.parseDifficulty(difficulty);
        String normalizedStrategy = strategy == null || strategy.isBlank() ? "recent" : strategy.trim().toLowerCase();

        List<WrongQuestionStat> wrongStats = buildWrongQuestionStats(userId, subjectId, chapterId, normalizedDifficulty);
        wrongStats = applyStrategyFilter(wrongStats, normalizedStrategy);

        return wrongStats.stream()
                .sorted(comparatorFor(normalizedStrategy))
                .limit(safeLimit)
                .map(WrongQuestionStat::question)
                .map(questionMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countSmartWrongPracticeQuestions(Long subjectId, Long chapterId, String difficulty, UUID userId) {
        requireUser(userId);
        QuestionDifficulty normalizedDifficulty = difficulty == null || difficulty.isBlank() || "ALL".equalsIgnoreCase(difficulty)
                ? null
                : questionMapper.parseDifficulty(difficulty);
        return buildWrongQuestionStats(userId, subjectId, chapterId, normalizedDifficulty).size();
    }

    @Transactional(readOnly = true)
    public long countPracticeQuestions(Long subjectId, Long chapterId, String difficulty) {
        QuestionDifficulty normalizedDifficulty = difficulty == null || difficulty.isBlank() || "ALL".equalsIgnoreCase(difficulty)
                ? null
                : questionMapper.parseDifficulty(difficulty);
        return questionRepository.countPracticeQuestionsForScope(subjectId, chapterId, normalizedDifficulty);
    }

    private List<WrongQuestionStat> buildWrongQuestionStats(UUID userId, Long subjectId, Long chapterId, QuestionDifficulty difficulty) {
        Map<AttemptQuestionKey, List<UserAnswer>> answersByAttemptQuestion =
                userAnswerRepository.findSubmittedAnswersByUserForPractice(userId, subjectId, chapterId).stream()
                        .filter(userAnswer -> Boolean.TRUE.equals(userAnswer.getQuestion().getPracticeEnabled()))
                        .filter(userAnswer -> difficulty == null || difficulty.equals(userAnswer.getQuestion().getDifficulty()))
                        .collect(Collectors.groupingBy(
                                userAnswer -> new AttemptQuestionKey(
                                        userAnswer.getUserExam().getUserExamId(),
                                        userAnswer.getQuestion().getQuestionId()
                                ),
                                LinkedHashMap::new,
                                Collectors.toList()
                        ));

        Map<Long, WrongQuestionStat> statsByQuestion = new HashMap<>();
        answersByAttemptQuestion.values().forEach(userAnswers -> recordAttempt(statsByQuestion, userAnswers));
        return statsByQuestion.values().stream()
                .filter(stat -> stat.question() != null)
                .filter(WrongQuestionStat::lastAttemptWrong)
                .toList();
    }

    private void recordAttempt(Map<Long, WrongQuestionStat> statsByQuestion, List<UserAnswer> userAnswers) {
        if (userAnswers.isEmpty()) {
            return;
        }
        Question question = userAnswers.get(0).getQuestion();
        Set<Long> correctAnswerIds = question.getAnswers().stream()
                .filter(answer -> Boolean.TRUE.equals(answer.getIsCorrect()))
                .map(answer -> answer.getOptionId())
                .collect(Collectors.toSet());
        Set<Long> chosenAnswerIds = userAnswers.stream()
                .map(userAnswer -> userAnswer.getAnswer().getOptionId())
                .collect(Collectors.toSet());
        LocalDateTime submittedAt = Optional.ofNullable(userAnswers.get(0).getUserExam().getEndTime())
                .orElse(Optional.ofNullable(userAnswers.get(0).getUserExam().getUpdatedAt())
                        .orElse(userAnswers.get(0).getUserExam().getStartTime()));
        boolean wrong = !correctAnswerIds.equals(chosenAnswerIds);
        WrongQuestionStat currentStat = statsByQuestion.computeIfAbsent(
                question.getQuestionId(),
                id -> new WrongQuestionStat(question)
        );
        statsByQuestion.put(question.getQuestionId(), currentStat.recordAttempt(submittedAt, wrong));
    }

    private Set<Long> findWrongQuestionIds(UUID userId, Long chapterId) {
        Map<AttemptQuestionKey, List<UserAnswer>> answersByAttemptQuestion = userAnswerRepository
                .findSubmittedAnswersByUserAndChapter(userId, chapterId).stream()
                .collect(Collectors.groupingBy(
                        answer -> new AttemptQuestionKey(
                                answer.getUserExam().getUserExamId(),
                                answer.getQuestion().getQuestionId()
                        ),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        Map<Long, WrongQuestionStat> statsByQuestion = new HashMap<>();
        answersByAttemptQuestion.values().forEach(userAnswers -> recordAttempt(statsByQuestion, userAnswers));
        return statsByQuestion.values().stream()
                .filter(WrongQuestionStat::lastAttemptWrong)
                .map(stat -> stat.question().getQuestionId())
                .collect(Collectors.toSet());
    }

    private List<WrongQuestionStat> applyStrategyFilter(List<WrongQuestionStat> wrongStats, String strategy) {
        if (!"weak-chapter".equals(strategy)) {
            return wrongStats;
        }
        Optional<Long> weakestChapterId = wrongStats.stream()
                .collect(Collectors.groupingBy(
                        stat -> stat.question().getChapter().getChapterId(),
                        Collectors.summingInt(WrongQuestionStat::wrongCount)
                ))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey);
        if (weakestChapterId.isEmpty()) {
            return wrongStats;
        }
        return wrongStats.stream()
                .filter(stat -> weakestChapterId.get().equals(stat.question().getChapter().getChapterId()))
                .toList();
    }

    private Comparator<WrongQuestionStat> comparatorFor(String strategy) {
        return switch (strategy) {
            case "frequent", "most-wrong" -> Comparator
                    .comparingInt(WrongQuestionStat::wrongCount)
                    .reversed()
                    .thenComparing(WrongQuestionStat::lastWrongAt, Comparator.reverseOrder());
            default -> Comparator.comparing(WrongQuestionStat::lastWrongAt, Comparator.reverseOrder());
        };
    }

    private int normalizeLimit(Integer limit, int defaultLimit) {
        return limit == null || limit <= 0 ? defaultLimit : Math.min(limit, 100);
    }

    private void requireUser(UUID userId) {
        if (userId == null) {
            throw new CustomApiException("Vui lòng đăng nhập để tiếp tục", HttpStatus.UNAUTHORIZED);
        }
    }

    private record AttemptQuestionKey(Long userExamId, Long questionId) {
    }

    private record WrongQuestionStat(
            Question question,
            int wrongCount,
            LocalDateTime lastWrongAt,
            LocalDateTime lastAttemptAt,
            boolean lastAttemptWrong) {
        private WrongQuestionStat(Question question) {
            this(question, 0, LocalDateTime.MIN, LocalDateTime.MIN, false);
        }

        private WrongQuestionStat recordAttempt(LocalDateTime submittedAt, boolean wrong) {
            LocalDateTime nextLastWrongAt = wrong && submittedAt.isAfter(lastWrongAt) ? submittedAt : lastWrongAt;
            boolean nextLastAttemptWrong = submittedAt.isBefore(lastAttemptAt) ? lastAttemptWrong : wrong;
            LocalDateTime nextLastAttemptAt = submittedAt.isAfter(lastAttemptAt) ? submittedAt : lastAttemptAt;
            return new WrongQuestionStat(
                    question,
                    wrong ? wrongCount + 1 : wrongCount,
                    nextLastWrongAt,
                    nextLastAttemptAt,
                    nextLastAttemptWrong);
        }
    }
}
