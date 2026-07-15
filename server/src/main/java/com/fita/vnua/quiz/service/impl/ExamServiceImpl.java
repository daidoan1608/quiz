package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.ExamDto;
import com.fita.vnua.quiz.model.dto.ExamSummaryDto;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.generator.ExamQuestionId;
import com.fita.vnua.quiz.model.dto.request.ExamRequest;
import com.fita.vnua.quiz.model.entity.*;
import com.fita.vnua.quiz.repository.*;
import com.fita.vnua.quiz.service.ExamService;
import com.fita.vnua.quiz.service.NotificationService;
import com.fita.vnua.quiz.service.QuestionService;
import com.fita.vnua.quiz.service.SoftDeleteService;
import com.fita.vnua.quiz.service.UserExamService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {
    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;
    private final QuestionService questionService;
    private final ModelMapper modelMapper;
    private final ExamQuestionRepository examQuestionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final UserAnswerRepository userAnswerRepository;
    private final UserExamRepository userExamRepository;
    private final SoftDeleteService softDeleteService;
    private final UserExamService userExamService;

    protected List<ExamSummaryDto> mapExamsToSummaryDtos(List<Exam> exams) {
        return exams.stream()
                .map(this::mapExamToSummaryDto)
                .toList();
    }

    private ExamSummaryDto mapExamToSummaryDto(Exam exam) {
        ExamSummaryDto dto = new ExamSummaryDto();
        dto.setExamId(exam.getExamId());
        dto.setTitle(exam.getTitle());
        dto.setDescription(exam.getDescription());
        dto.setDuration(exam.getDuration());
        dto.setSubjectId(exam.getSubject().getSubjectId());
        dto.setSubjectName(exam.getSubject().getName());
        dto.setCreatedBy(exam.getCreatedBy().getUserId());
        dto.setCreatedDate(String.valueOf(exam.getCreatedTime()));
        dto.setQuestionCount(examQuestionRepository.countByExam(exam).intValue());
        return dto;
    }

    @Override
    public List<ExamSummaryDto> getAllExams() {
        List<Exam> exams = examRepository.findByDeletedFalse();
        return mapExamsToSummaryDtos(exams);
    }

    @Override
    public List<ExamSummaryDto> getDeletedExams() {
        return mapExamsToSummaryDtos(examRepository.findByDeletedTrue());
    }

    @Override
    public List<ExamSummaryDto> getExamsBySubjectId(Long subjectId) {
        List<Exam> exams = examRepository.findExamsBySubjectId(subjectId);
        return mapExamsToSummaryDtos(exams);
    }

    @Override
    public ExamDto getExamById(Long id) {
        Exam exam = examRepository.findByExamIdAndDeletedFalse(id)
                .orElseThrow(() -> new CustomApiException("Exam not found", HttpStatus.NOT_FOUND));
        ExamDto examDto = new ExamDto();
        examDto.setExamId(exam.getExamId());
        examDto.setTitle(exam.getTitle());
        examDto.setDescription(exam.getDescription());
        examDto.setDuration(exam.getDuration());
        examDto.setSubjectId(exam.getSubject().getSubjectId());
        examDto.setSubjectName(subjectRepository.findById(exam.getSubject().getSubjectId())
                .orElseThrow(() -> new CustomApiException("Subject not found", HttpStatus.NOT_FOUND))
                .getName());
        examDto.setCreatedBy(exam.getCreatedBy().getUserId());
        examDto.setCreatedDate(String.valueOf(exam.getCreatedTime()));
        examDto.setQuestions(questionService.getQuestionsByExamId(exam.getExamId()));
        return examDto;
    }

//    @Override
//    public ExamDto createExam(ExamRequest examRequest) {
//        // Tạo Exam mới
//        ExamDto examDto = examRequest.getExamDto();
//        Exam exam = new Exam();
//        exam.setTitle(examDto.getTitle());
//        exam.setSubject(subjectRepository.findById(examDto.getSubjectId()).orElseThrow(() -> new RuntimeException("Subject not found")));
//        exam.setDescription(examDto.getDescription());
//        exam.setDuration(examDto.getDuration());
//        exam.setCreatedBy(userRepository.findById(examDto.getCreatedBy()).orElseThrow(() -> new RuntimeException("User not found")));
//        exam.setCreatedTime(LocalDate.now());
//        exam = examRepository.save(exam);
//
//        examDto.setExamId(exam.getExamId());
//        examDto.setCreatedDate(String.valueOf(exam.getCreatedTime()));
//
//        if (examRequest.getTotalQuestions() > 0) {
//            List<QuestionDto> questionDtos = questionService.getQuestionsBySubjectAndNumber(examDto.getSubjectId(), examRequest.getTotalQuestions());
//
//            // Chuyển đổi từ DTO sang Entity cho tất cả câu hỏi
//            List<Question> allQuestions = questionDtos.stream()
//                    .map(questionDto -> modelMapper.map(questionDto, Question.class))
//                    .toList();
//
//            // Lưu liên kết ExamQuestion cho tất cả câu hỏi
//            for (Question question : allQuestions) {
//                ExamQuestionId examQuestionId = new ExamQuestionId();
//                examQuestionId.setExamId(exam.getExamId());
//                examQuestionId.setQuestionId(question.getQuestionId());
//                ExamQuestion examQuestion = new ExamQuestion();
//                examQuestion.setExam(exam);
//                examQuestion.setQuestion(question);
//                examQuestion.setId(examQuestionId);
//                examQuestionRepository.save(examQuestion);
//            }
//            examDto.setQuestions(questionDtos);
//        }
//        if (examRequest.getEasyQuestions() > 0 && examRequest.getMediumQuestions() > 0 && examRequest.getHardQuestions() > 0) {
//            List<QuestionDto> questionDtos = new ArrayList<>();
//
//            // Lấy câu hỏi dễ
//            if (examRequest.getEasyQuestions() > 0) {
//                questionDtos.addAll(questionService.getQuestionsBySubjectAndDifficulty(examDto.getSubjectId(), examRequest.getEasyQuestions(), "EASY"));
//            }
//
//            // Lấy câu hỏi trung bình
//            if (examRequest.getMediumQuestions() > 0) {
//                questionDtos.addAll(questionService.getQuestionsBySubjectAndDifficulty(examDto.getSubjectId(), examRequest.getMediumQuestions(), "MEDIUM"));
//            }
//
//            // Lấy câu hỏi khó
//            if (examRequest.getHardQuestions() > 0) {
//                questionDtos.addAll(questionService.getQuestionsBySubjectAndDifficulty(examDto.getSubjectId(), examRequest.getHardQuestions(), "HARD"));
//            }
//
//            List<Question> allQuestions = questionDtos.stream()
//                    .map(questionDto -> modelMapper.map(questionDto, Question.class))
//                    .toList();
//
//            // Lưu liên kết ExamQuestion cho tất cả câu hỏi
//            for (Question question : allQuestions) {
//                ExamQuestionId examQuestionId = new ExamQuestionId();
//                examQuestionId.setExamId(exam.getExamId());
//                examQuestionId.setQuestionId(question.getQuestionId());
//                ExamQuestion examQuestion = new ExamQuestion();
//                examQuestion.setExam(exam);
//                examQuestion.setQuestion(question);
//                examQuestion.setId(examQuestionId);
//                examQuestionRepository.save(examQuestion);
//            }
//            examDto.setQuestions(questionDtos);
//        }
//        if (!examRequest.getTotalQuestionByChapter().isEmpty()) {
//            List<QuestionDto> chapterQuestions = new ArrayList<>();
//            for (Map.Entry<Long, Integer> entry : examRequest.getTotalQuestionByChapter().entrySet()) {
//                Long chapterId = entry.getKey();  // Lấy chapterId
//                Integer selectedQuestions = entry.getValue();
//                if (selectedQuestions > 0) {
//                    chapterQuestions.addAll(questionService.getQuestionsByChapter(chapterId, selectedQuestions));
//                }
//            }
//            List<Question> allQuestions = chapterQuestions.stream()
//                    .map(questionDto -> modelMapper.map(questionDto, Question.class))
//                    .toList();
//            for (Question question : allQuestions) {
//                ExamQuestionId examQuestionId = new ExamQuestionId();
//                examQuestionId.setExamId(exam.getExamId());
//                examQuestionId.setQuestionId(question.getQuestionId());
//                ExamQuestion examQuestion = new ExamQuestion();
//                examQuestion.setExam(exam);
//                examQuestion.setQuestion(question);
//                examQuestion.setId(examQuestionId);
//                examQuestionRepository.save(examQuestion);
//            }
//            examDto.setQuestions(chapterQuestions);
//        }
//        return examDto;
//    }

    @Override
    @Transactional // Đảm bảo tính toàn vẹn dữ liệu
    public ExamDto createExam(ExamRequest examRequest, UUID currentUserId) {
        // 1. Tạo Exam mới & Lưu thông tin cơ bản
        ExamDto examDto = examRequest.getExamDto();
        Exam exam = new Exam();
        exam.setTitle(examDto.getTitle());

        // Lấy đối tượng Subject để dùng sau này cho việc gửi thông báo
        Subject subject = subjectRepository.findById(examDto.getSubjectId())
                .orElseThrow(() -> new CustomApiException("Subject not found", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(subject.getDeleted())) {
            throw new CustomApiException("Subject not found", HttpStatus.NOT_FOUND);
        }
        exam.setSubject(subject);

        exam.setDescription(examDto.getDescription());
        exam.setDuration(examDto.getDuration());
        exam.setCreatedBy(userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomApiException("User not found", HttpStatus.NOT_FOUND)));
        exam.setCreatedTime(LocalDate.now());

        // Lưu lần 1 để lấy Exam ID
        exam = examRepository.save(exam);

        examDto.setExamId(exam.getExamId());
        examDto.setCreatedBy(exam.getCreatedBy().getUserId());
        examDto.setCreatedDate(String.valueOf(exam.getCreatedTime()));

        // 2. Logic thêm câu hỏi (Giữ nguyên code cũ của bạn)
        // ... (Logic TotalQuestions) ...
        if (examRequest.getTotalQuestions() > 0) {
            List<QuestionDto> questionDtos = questionService.getQuestionsBySubjectAndNumber(examDto.getSubjectId(), examRequest.getTotalQuestions());
            saveQuestionsToExam(exam, questionDtos); // Mình tách hàm save cho gọn code bên dưới
            examDto.setQuestions(questionDtos);
        }

        // ... (Logic Difficulty) ...
        if (examRequest.getEasyQuestions() > 0 || examRequest.getMediumQuestions() > 0 || examRequest.getHardQuestions() > 0) {
            List<QuestionDto> questionDtos = new ArrayList<>();
            if (examRequest.getEasyQuestions() > 0)
                questionDtos.addAll(questionService.getQuestionsBySubjectAndDifficulty(examDto.getSubjectId(), examRequest.getEasyQuestions(), "EASY"));
            if (examRequest.getMediumQuestions() > 0)
                questionDtos.addAll(questionService.getQuestionsBySubjectAndDifficulty(examDto.getSubjectId(), examRequest.getMediumQuestions(), "MEDIUM"));
            if (examRequest.getHardQuestions() > 0)
                questionDtos.addAll(questionService.getQuestionsBySubjectAndDifficulty(examDto.getSubjectId(), examRequest.getHardQuestions(), "HARD"));

            saveQuestionsToExam(exam, questionDtos);
            examDto.setQuestions(questionDtos);
        }

        // ... (Logic Chapter) ...
        if (!examRequest.getTotalQuestionByChapter().isEmpty()) {
            List<QuestionDto> chapterQuestions = new ArrayList<>();
            for (Map.Entry<Long, Integer> entry : examRequest.getTotalQuestionByChapter().entrySet()) {
                if (entry.getValue() > 0) {
                    chapterQuestions.addAll(questionService.getQuestionsByChapter(entry.getKey(), entry.getValue()));
                }
            }
            saveQuestionsToExam(exam, chapterQuestions);
            examDto.setQuestions(chapterQuestions);
        }

        // 3. --- TÍCH HỢP GỬI THÔNG BÁO TỰ ĐỘNG ---
        // Đặt ở cuối cùng để chắc chắn đề thi đã tạo thành công
        try {
            notificationService.sendSubjectNotification(
                    subject.getSubjectId(),    // ID môn học
                    subject.getName(),  // Tên môn học (Check lại getter trong Entity Subject của bạn)
                    exam.getExamId()           // ID đề thi để user click vào
            );
        } catch (Exception e) {
            // Log lỗi nhưng KHÔNG throw exception.
            // Để tránh việc tạo đề thi thành công mà thông báo lỗi lại rollback cả đề thi.
            System.err.println("Lỗi gửi thông báo: " + e.getMessage());
            e.printStackTrace();
        }

        return examDto;
    }

    // Hàm phụ mình tách ra để code đỡ bị lặp lại (Optional - bạn dùng hay không tùy ý)
    private void saveQuestionsToExam(Exam exam, List<QuestionDto> questionDtos) {
        List<Question> allQuestions = questionDtos.stream()
                .map(questionDto -> modelMapper.map(questionDto, Question.class))
                .toList();

        for (Question question : allQuestions) {
            ExamQuestionId examQuestionId = new ExamQuestionId();
            examQuestionId.setExamId(exam.getExamId());
            examQuestionId.setQuestionId(question.getQuestionId());

            ExamQuestion examQuestion = new ExamQuestion();
            examQuestion.setExam(exam);
            examQuestion.setQuestion(question);
            examQuestion.setId(examQuestionId);

            examQuestionRepository.save(examQuestion);
        }
    }

    @Override
    @Transactional
    public ExamDto updateExam(Long id, ExamDto examDto) {
        Exam exam = examRepository.findByExamIdAndDeletedFalse(id)
                .orElseThrow(() -> new CustomApiException("Exam not found", HttpStatus.NOT_FOUND));
        exam.setTitle(examDto.getTitle());
        exam.setDescription(examDto.getDescription());
        exam.setDuration(examDto.getDuration());
        if (examDto.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(examDto.getSubjectId())
                    .orElseThrow(() -> new CustomApiException("Subject not found", HttpStatus.NOT_FOUND));
            if (Boolean.TRUE.equals(subject.getDeleted())) {
                throw new CustomApiException("Subject not found", HttpStatus.NOT_FOUND);
            }
            exam.setSubject(subject);
        }
        Exam updatedExam = examRepository.save(exam);

        ExamDto resultDto = new ExamDto();
        resultDto.setExamId(updatedExam.getExamId());
        resultDto.setTitle(updatedExam.getTitle());
        resultDto.setDescription(updatedExam.getDescription());
        resultDto.setDuration(updatedExam.getDuration());
        resultDto.setSubjectId(updatedExam.getSubject().getSubjectId());
        resultDto.setCreatedBy(updatedExam.getCreatedBy().getUserId());
        resultDto.setCreatedDate(String.valueOf(updatedExam.getCreatedTime()));
        resultDto.setQuestions(questionService.getQuestionsByExamId(updatedExam.getExamId()));
        return resultDto;
    }

    @Override
    @Transactional
    public void deleteExam(Long id) {
        softDeleteService.deleteExam(id, null);
    }

    @Override
    @Transactional
    public ExamDto restoreExam(Long id) {
        softDeleteService.restoreExam(id);
        return getExamById(id);
    }

    @Override
    public ExamDto getExamByIdForSubmittedAttempt(Long examId, Long userExamId, UUID currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomApiException("Access denied", HttpStatus.FORBIDDEN));
        UserExam userExam = (currentUser.getRole() == User.Role.ADMIN || currentUser.getRole() == User.Role.MOD)
                ? userExamRepository.findById(userExamId).orElseThrow(() -> new CustomApiException("Access denied", HttpStatus.FORBIDDEN))
                : userExamRepository.findByIdAndUserId(userExamId, currentUserId)
                        .orElseThrow(() -> new CustomApiException("Access denied", HttpStatus.FORBIDDEN));
        if (!examId.equals(userExam.getExam().getExamId()) || !"SUBMITTED".equals(userExam.getStatus())) {
            throw new CustomApiException("Access denied", HttpStatus.FORBIDDEN);
        }
        List<QuestionDto> questions = userExamService.getAttemptQuestionsForSubmittedAttempt(userExamId, currentUserId).stream()
                .map(question -> modelMapper.map(question, QuestionDto.class))
                .toList();
        return mapExamToDto(userExam.getExam(), questions);
    }

    private ExamDto mapExamToDto(Exam exam, List<QuestionDto> questions) {
        ExamDto examDto = new ExamDto();
        examDto.setExamId(exam.getExamId());
        examDto.setTitle(exam.getTitle());
        examDto.setDescription(exam.getDescription());
        examDto.setDuration(exam.getDuration());
        examDto.setSubjectId(exam.getSubject().getSubjectId());
        examDto.setSubjectName(exam.getSubject().getName());
        examDto.setCreatedBy(exam.getCreatedBy().getUserId());
        examDto.setCreatedDate(String.valueOf(exam.getCreatedTime()));
        examDto.setQuestions(questions);
        return examDto;
    }
}
