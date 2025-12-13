package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.ExamDto;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.genaretor.ExamQuestionId;
import com.fita.vnua.quiz.model.dto.request.ExamRequest;
import com.fita.vnua.quiz.model.entity.*;
import com.fita.vnua.quiz.repository.*;
import com.fita.vnua.quiz.service.ExamService;
import com.fita.vnua.quiz.service.NotificationService;
import com.fita.vnua.quiz.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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

    protected List<ExamDto> mapExamsToExamDtos(List<Exam> exams) {
        List<ExamDto> examDtos = new ArrayList<>();
        for (Exam exam : exams) {
            ExamDto examDto = new ExamDto();
            examDto.setExamId(exam.getExamId());
            examDto.setTitle(exam.getTitle());
            examDto.setDescription(exam.getDescription());
            examDto.setDuration(exam.getDuration());
            examDto.setSubjectId(exam.getSubject().getSubjectId());
            examDto.setCreatedBy(exam.getCreatedBy().getUserId());
            examDto.setCreatedDate(String.valueOf(exam.getCreatedTime()));
            examDto.setQuestions(questionService.getQuestionsByExamId(exam.getExamId()));
            examDtos.add(examDto);
        }
        return examDtos;
    }

    @Override
    public List<ExamDto> getAllExams() {
        List<Exam> exams = examRepository.findAll();
        return mapExamsToExamDtos(exams);
    }

    @Override
    public List<ExamDto> getExamsBySubjectId(Long subjectId) {
        List<Exam> exams = examRepository.findExamsBySubjectId(subjectId);
        return mapExamsToExamDtos(exams);
    }

    @Override
    public ExamDto getExamById(Long id) {
        Exam exam = examRepository.findExamByExamId(id);
        ExamDto examDto = new ExamDto();
        examDto.setExamId(exam.getExamId());
        examDto.setTitle(exam.getTitle());
        examDto.setDescription(exam.getDescription());
        examDto.setDuration(exam.getDuration());
        examDto.setSubjectId(exam.getSubject().getSubjectId());
        examDto.setSubjectName(subjectRepository.findById(exam.getSubject().getSubjectId()).orElseThrow(() -> new RuntimeException("Subject not found")).getName());
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
    public ExamDto createExam(ExamRequest examRequest) {
        // 1. Tạo Exam mới & Lưu thông tin cơ bản
        ExamDto examDto = examRequest.getExamDto();
        Exam exam = new Exam();
        exam.setTitle(examDto.getTitle());

        // Lấy đối tượng Subject để dùng sau này cho việc gửi thông báo
        Subject subject = subjectRepository.findById(examDto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        exam.setSubject(subject);

        exam.setDescription(examDto.getDescription());
        exam.setDuration(examDto.getDuration());
        exam.setCreatedBy(userRepository.findById(examDto.getCreatedBy())
                .orElseThrow(() -> new RuntimeException("User not found")));
        exam.setCreatedTime(LocalDate.now());

        // Lưu lần 1 để lấy Exam ID
        exam = examRepository.save(exam);

        examDto.setExamId(exam.getExamId());
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
    public ExamDto updateExam(Long id, ExamDto examDto) {
        return null;
    }

    @Override
    public void deleteExam(Long id) {

    }
}