package com.fita.vnua.quiz.service.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.AnswerDto;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.UserAnswerDto;
import com.fita.vnua.quiz.model.dto.UserExamDto;
import com.fita.vnua.quiz.model.dto.response.ExamAttemptResponse;
import com.fita.vnua.quiz.model.dto.response.UserExamResponse;
import com.fita.vnua.quiz.model.entity.Answer;
import com.fita.vnua.quiz.model.entity.Exam;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.model.entity.Subject;
import com.fita.vnua.quiz.model.entity.UserAnswer;
import com.fita.vnua.quiz.model.entity.UserExam;
import com.fita.vnua.quiz.model.entity.UserExamQuestion;
import com.fita.vnua.quiz.service.impl.UserExamAttemptStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class UserExamMapper {
    private final ObjectMapper objectMapper;
    private final QuestionMapper questionMapper;

    public UserExamDto toDto(UserExam userExam, UserExamAttemptStatsService.AttemptStats stats) {
        UserExamDto dto = toListDto(userExam);
        if (stats != null) {
            dto.setTotalQuestions(stats.totalQuestions());
            dto.setCorrectAnswers(stats.correctAnswers());
        } else {
            dto.setTotalQuestions(0);
            dto.setCorrectAnswers(0);
        }
        return dto;
    }

    public UserExamDto toListDto(UserExam userExam) {
        UserExamDto dto = new UserExamDto();
        dto.setUserExamId(userExam.getUserExamId());
        dto.setStartTime(userExam.getStartTime());
        dto.setEndTime(userExam.getEndTime());
        dto.setScore(userExam.getScore());
        dto.setStatus(userExam.getStatus());
        dto.setRemainingTime(userExam.getRemainingTime());
        dto.setCurrentQuestionIndex(userExam.getCurrentQuestionIndex());
        dto.setUserId(userExam.getUser() == null ? null : userExam.getUser().getUserId());
        dto.setExamId(userExam.getExam() == null ? null : userExam.getExam().getExamId());
        return dto;
    }

    public UserExamResponse toListResponse(UserExam userExam, UserExamAttemptStatsService.AttemptStats stats) {
        return baseResponse(userExam)
                .userExamDto(toDto(userExam, stats))
                .build();
    }

    public UserExamResponse toAdminListResponse(UserExam userExam) {
        return baseResponse(userExam)
                .userExamDto(toListDto(userExam))
                .build();
    }

    public UserExamResponse toDetailResponse(
            UserExam userExam,
            UserExamAttemptStatsService.AttemptStats stats,
            List<UserAnswer> answers,
            List<QuestionDto> questions
    ) {
        return baseResponse(userExam)
                .userExamDto(toDto(userExam, stats))
                .userAnswerDtos(toUserAnswerDtos(answers))
                .questions(questions)
                .build();
    }

    public ExamAttemptResponse toAttemptResponse(
            UserExam userExam,
            List<UserAnswer> answers,
            List<QuestionDto> questions
    ) {
        List<UserAnswerDto> answerDtos = toUserAnswerDtos(answers);
        Exam exam = userExam.getExam();
        Subject subject = exam == null ? null : exam.getSubject();
        return ExamAttemptResponse.builder()
                .userExamId(userExam.getUserExamId())
                .examId(exam == null ? null : exam.getExamId())
                .subjectId(subject == null ? null : subject.getSubjectId())
                .title(exam == null ? null : exam.getTitle())
                .subjectName(subject == null ? null : subject.getName())
                .status(userExam.getStatus())
                .startTime(userExam.getStartTime())
                .endTime(userExam.getEndTime())
                .updatedAt(userExam.getUpdatedAt())
                .remainingTime(userExam.getRemainingTime())
                .currentQuestionIndex(userExam.getCurrentQuestionIndex())
                .answeredCount((int) answerDtos.stream().map(UserAnswerDto::getQuestionId).distinct().count())
                .totalQuestions(questions.size())
                .score(userExam.getScore())
                .userAnswerDtos(answerDtos)
                .questions(questions)
                .build();
    }

    public List<QuestionDto> toQuestionDtos(List<Question> questions) {
        return questions.stream()
                .map(questionMapper::toDto)
                .toList();
    }

    public QuestionDto toQuestionDto(UserExamQuestion snapshot) {
        Question question = snapshot.getQuestion();
        QuestionDto dto = new QuestionDto();
        dto.setQuestionId(question.getQuestionId());
        dto.setContent(snapshot.getQuestionContentSnapshot());
        dto.setImageUrl(snapshot.getQuestionImageUrlSnapshot());
        dto.setDifficulty(snapshot.getQuestionDifficultySnapshot());
        dto.setQuestionType(snapshot.getQuestionTypeSnapshot());
        if (question.getChapter() != null) {
            dto.setChapterId(question.getChapter().getChapterId());
            dto.setChapterName(question.getChapter().getName());
        }
        dto.setExamEnabled(question.getExamEnabled());
        dto.setPracticeEnabled(question.getPracticeEnabled());
        dto.setAnswers(readAnswersSnapshot(snapshot));
        return dto;
    }

    public String toAnswersSnapshotJson(Question question) {
        try {
            return objectMapper.writeValueAsString(toAnswerDtos(question));
        } catch (JsonProcessingException exception) {
            throw new CustomApiException("Khong the tao snapshot dap an cho luot thi", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private List<UserAnswerDto> toUserAnswerDtos(List<UserAnswer> answers) {
        return answers.stream()
                .map(this::toUserAnswerDto)
                .toList();
    }

    private UserAnswerDto toUserAnswerDto(UserAnswer userAnswer) {
        UserAnswerDto dto = new UserAnswerDto();
        dto.setUserAnswerId(userAnswer.getUserAnswerId());
        dto.setUserExamId(userAnswer.getUserExam().getUserExamId());
        dto.setQuestionId(userAnswer.getQuestion().getQuestionId());
        dto.setAnswerId(userAnswer.getAnswer().getOptionId());
        return dto;
    }

    private List<AnswerDto> readAnswersSnapshot(UserExamQuestion snapshot) {
        if (snapshot.getAnswersSnapshotJson() == null || snapshot.getAnswersSnapshotJson().isBlank()) {
            return toAnswerDtos(snapshot.getQuestion());
        }
        try {
            return objectMapper.readValue(snapshot.getAnswersSnapshotJson(), new TypeReference<List<AnswerDto>>() {
            });
        } catch (JsonProcessingException exception) {
            return toAnswerDtos(snapshot.getQuestion());
        }
    }

    private List<AnswerDto> toAnswerDtos(Question question) {
        return question.getAnswers().stream()
                .map(answer -> toAnswerDto(question, answer))
                .toList();
    }

    private AnswerDto toAnswerDto(Question question, Answer answer) {
        AnswerDto dto = new AnswerDto();
        dto.setOptionId(answer.getOptionId());
        dto.setQuestionId(question.getQuestionId());
        dto.setContent(answer.getContent());
        dto.setIsCorrect(answer.getIsCorrect());
        return dto;
    }

    private UserExamResponse.UserExamResponseBuilder baseResponse(UserExam userExam) {
        Exam exam = userExam.getExam();
        Subject subject = exam == null ? null : exam.getSubject();
        return UserExamResponse.builder()
                .subjectName(subject == null ? null : subject.getName())
                .title(exam == null ? null : exam.getTitle())
                .username(userExam.getUser() == null ? null : userExam.getUser().getUsername())
                .fullName(userExam.getUser() == null ? null : userExam.getUser().getFullName());
    }
}
