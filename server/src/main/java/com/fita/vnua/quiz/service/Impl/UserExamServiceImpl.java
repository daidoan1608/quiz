package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.SubjectDto;
import com.fita.vnua.quiz.model.dto.UserAnswerDto;
import com.fita.vnua.quiz.model.dto.UserExamDto;
import com.fita.vnua.quiz.model.dto.request.UserExamRequest;
import com.fita.vnua.quiz.model.dto.response.UserExamResponse;
import com.fita.vnua.quiz.model.entity.*;
import com.fita.vnua.quiz.repository.*;
import com.fita.vnua.quiz.service.SubjectService;
import com.fita.vnua.quiz.service.UserExamService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserExamServiceImpl implements UserExamService {
    private final UserExamRepository userExamRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final UserRepository userRepository;
    private final ExamRepository examRepository;
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final ModelMapper modelMapper;
    private final SubjectService subjectService;


    @Override
    public UserExamResponse getUserExamById(Long id) {
        UserExam userExam = userExamRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User exam not found with id: " + id));
        UserExamDto userExamDto = convertUserExamsToUserExamDto(userExam);
        List<UserAnswer> userAnswer = userAnswerRepository.findUserAnswersByUserExamId(id);
        List<UserAnswerDto> userAnswerDtos = new ArrayList<>();
        for (UserAnswer userAnswer1 : userAnswer) {
            UserAnswerDto userAnswerDto = new UserAnswerDto();
            userAnswerDto.setAnswerId(userAnswer1.getAnswer().getOptionId());
            userAnswerDto.setQuestionId(userAnswer1.getQuestion().getQuestionId());
            userAnswerDto.setUserExamId(userAnswer1.getUserExam().getUserExamId());
            userAnswerDtos.add(userAnswerDto);
        }
        SubjectDto subject = subjectService.getSubjectById(userExam.getExam().getSubject().getSubjectId());
        return UserExamResponse.builder()
                .userExamDto(userExamDto)
                .userAnswerDtos(userAnswerDtos)
                .subjectName(subject.getName())
                .title(userExam.getExam().getTitle())
                .build();
    }

    @Override
    public UserExamDto createUserExam(UserExamRequest userExamRequest) {
        UserExamDto userExamDto = userExamRequest.getUserExamDto();
        List<UserAnswerDto> userAnswerDtos = userExamRequest.getUserAnswerDtos();

        User user = userRepository.findById(userExamDto.getUserId()).orElse(null);
        Exam exam = examRepository.findById(userExamDto.getExamId()).orElse(null);

        UserExam userExam = new UserExam();
        userExam.setStartTime(userExamDto.getStartTime());
        userExam.setEndTime(userExamDto.getEndTime());
        userExam.setScore(userExamDto.getScore());
        userExam.setUser(user);
        userExam.setExam(exam);

        UserExam savedUserExam = userExamRepository.save(modelMapper.map(userExamDto, UserExam.class));

        for (UserAnswerDto userAnswerDto : userAnswerDtos) {
            // Kiểm tra các trường quan trọng trước khi thao tác
            if (userAnswerDto.getAnswerId() == null || userAnswerDto.getQuestionId() == null) {
                // Xử lý trường hợp thiếu dữ liệu
                log.error("Invalid user answer data: {}", userAnswerDto);
                continue;
            }

            userAnswerDto.setUserExamId(savedUserExam.getUserExamId());

            UserAnswer userAnswer = new UserAnswer();
            userAnswer.setUserExam(savedUserExam);

            Answer answer = answerRepository.findById(userAnswerDto.getAnswerId())
                    .orElseThrow(() -> new EntityNotFoundException("Answer not found with id: " + userAnswerDto.getAnswerId()));
            userAnswer.setAnswer(answer);

            Question question = questionRepository.findById(userAnswerDto.getQuestionId())
                    .orElseThrow(() -> new EntityNotFoundException("Question not found with id: " + userAnswerDto.getQuestionId()));
            userAnswer.setQuestion(question);

            userAnswerRepository.save(userAnswer);
        }
        return modelMapper.map(savedUserExam, UserExamDto.class);
    }

    @Override
    public List<UserExamResponse> getUserExamByUserId(UUID userId) {
        List<UserExam> userExams = userExamRepository.findUserExamsByUserId(userId);
        return getUserExamResponses(userExams);
    }

    @Override
    public List<Map<Long, Object>> getExamAttemptsByUserId(UUID userId) {
        return userExamRepository.countExamsByUserId(userId);
    }

    @Override
    public List<UserExamResponse> getAllUserExams() {
        List<UserExam> userExams = userExamRepository.findAll();
        return getUserExamResponses(userExams);
    }

    private List<UserExamResponse> getUserExamResponses(List<UserExam> userExams) {
        List<UserExamResponse> userExamResponses = new ArrayList<>();
        for (UserExam userExam : userExams) {
            SubjectDto subject = subjectService.getSubjectById(userExam.getExam().getSubject().getSubjectId());
            UserExamResponse userExamResponse = UserExamResponse
                    .builder()
                    .userExamDto(convertUserExamsToUserExamDto(userExam))
                    .subjectName(subject.getName())
                    .title(userExam.getExam().getTitle())
                    .build();
            userExamResponses.add(userExamResponse);
        }
        return userExamResponses;
    }

    protected UserExamDto convertUserExamsToUserExamDto(UserExam userExam) {
        UserExamDto userExamDto = new UserExamDto();
            userExamDto.setUserExamId(userExam.getUserExamId());
            userExamDto.setStartTime(userExam.getStartTime());
            userExamDto.setEndTime(userExam.getEndTime());
            userExamDto.setScore(userExam.getScore());
            userExamDto.setUserId(userExam.getUser().getUserId());
            userExamDto.setExamId(userExam.getExam().getExamId());
        return userExamDto;
    }
}
