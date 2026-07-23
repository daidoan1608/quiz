package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.enums.QuestionType;

import com.fita.vnua.quiz.model.entity.Answer;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.model.entity.UserAnswer;
import com.fita.vnua.quiz.model.entity.UserExam;
import com.fita.vnua.quiz.model.entity.UserExamQuestion;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.UserAnswerRepository;
import com.fita.vnua.quiz.repository.UserExamQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserExamAttemptStatsService {
    private final UserExamQuestionRepository userExamQuestionRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final QuestionRepository questionRepository;

    public Map<Long, AttemptStats> loadAttemptStats(List<UserExam> userExams) {
        List<Long> userExamIds = userExams.stream()
                .map(UserExam::getUserExamId)
                .toList();
        if (userExamIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, List<Question>> questionsByAttempt = userExamQuestionRepository
                .findWithQuestionDetailsByUserExamIds(userExamIds)
                .stream()
                .collect(Collectors.groupingBy(
                        snapshot -> snapshot.getUserExam().getUserExamId(),
                        LinkedHashMap::new,
                        Collectors.collectingAndThen(
                                Collectors.toMap(
                                        snapshot -> snapshot.getQuestion().getQuestionId(),
                                        UserExamQuestion::getQuestion,
                                        (first, ignored) -> first,
                                        LinkedHashMap::new
                                ),
                                map -> new ArrayList<>(map.values())
                        )
                ));

        List<UserAnswer> userAnswers = userAnswerRepository.findUserAnswersByUserExamIds(userExamIds);
        Map<Long, Map<Long, Set<Long>>> chosenAnswersByAttempt = userAnswers
                .stream()
                .collect(Collectors.groupingBy(
                        userAnswer -> userAnswer.getUserExam().getUserExamId(),
                        Collectors.groupingBy(
                                userAnswer -> userAnswer.getQuestion().getQuestionId(),
                                Collectors.mapping(userAnswer -> userAnswer.getAnswer().getOptionId(), Collectors.toSet())
                        )
                ));

        Map<Long, AttemptStats> statsByAttempt = new LinkedHashMap<>();
        for (UserExam userExam : userExams) {
            List<Question> questions = questionsByAttempt.get(userExam.getUserExamId());
            if (questions == null) {
                questions = getExamQuestionsIncludingDeleted(userExam.getExam().getExamId());
            }
            statsByAttempt.put(
                    userExam.getUserExamId(),
                    calculateStats(questions, chosenAnswersByAttempt.getOrDefault(userExam.getUserExamId(), Map.of()))
            );
        }
        return statsByAttempt;
    }

    public AttemptStats loadAttemptStats(UserExam userExam) {
        return loadAttemptStats(List.of(userExam)).getOrDefault(userExam.getUserExamId(), new AttemptStats(0, 0));
    }

    private AttemptStats calculateStats(List<Question> questions, Map<Long, Set<Long>> chosenAnswers) {
        int correctAnswers = 0;
        for (Question question : questions) {
            if (isQuestionCorrect(question, chosenAnswers.get(question.getQuestionId()))) {
                correctAnswers++;
            }
        }
        return new AttemptStats(questions.size(), correctAnswers);
    }

    private List<Question> getExamQuestionsIncludingDeleted(Long examId) {
        List<Question> questions = questionRepository.findQuestionsByExamIdIncludingDeleted(examId);
        if (questions != null && !questions.isEmpty()) {
            return questions;
        }
        return questionRepository.findQuestionsByExamId(examId);
    }

    private boolean isQuestionCorrect(Question question, Set<Long> chosenAnswerIds) {
        if (chosenAnswerIds == null || chosenAnswerIds.isEmpty()) return false;

        Set<Long> correctAnswerIds = question.getAnswers().stream()
                .filter(answer -> Boolean.TRUE.equals(answer.getIsCorrect()))
                .map(Answer::getOptionId)
                .collect(Collectors.toSet());
        if (correctAnswerIds.isEmpty()) return false;

        QuestionType questionType = question.getQuestionType() != null
                ? question.getQuestionType()
                : QuestionType.SINGLE_CHOICE;

        return switch (questionType) {
            case SINGLE_CHOICE -> chosenAnswerIds.size() == 1
                    && correctAnswerIds.size() == 1
                    && correctAnswerIds.equals(chosenAnswerIds);
            case MULTIPLE_CHOICE -> correctAnswerIds.equals(chosenAnswerIds);
            case FILL_IN_THE_BLANK -> false;
        };
    }

    public record AttemptStats(int totalQuestions, int correctAnswers) {
    }
}
