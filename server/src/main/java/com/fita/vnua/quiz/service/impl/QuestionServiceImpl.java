package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.response.ImportPreviewResponse;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.repository.AnswerRepository;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.service.QuestionService;
import com.fita.vnua.quiz.service.mapper.QuestionMapper;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final ChapterRepository chapterRepository;
    private final ModelMapper modelMapper;
    private final QuestionImportService questionImportService;
    private final QuestionMapper questionMapper;

    @Override
    public Optional<QuestionDto> getQuestionById(Long questionId) {
        return questionRepository.findByQuestionIdAndDeletedFalse(questionId)
                .map(question -> modelMapper.map(question, QuestionDto.class));
    }

    @Override
    public List<QuestionDto> getQuestionsByChapterId(Long chapterId) {
        return questionRepository.findByChapter(chapterId).stream().map(question -> modelMapper.map(question, QuestionDto.class)).toList();
    }

    @Override
    public List<QuestionDto> getAllQuestion() {
        return questionRepository.findByDeletedFalse().stream().map(question -> modelMapper.map(question, QuestionDto.class)).toList();
    }

    @Override
    public List<QuestionDto> getDeletedQuestions() {
        return questionRepository.findByDeletedTrue().stream().map(question -> modelMapper.map(question, QuestionDto.class)).toList();
    }

    @Override
    public List<QuestionDto> searchQuestions(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllQuestion();
        }
        return questionRepository.findByContentContainingIgnoreCase(keyword.trim()).stream()
                .map(question -> modelMapper.map(question, QuestionDto.class))
                .toList();
    }

    @Override
    public List<QuestionDto> getQuestionsBySubject(Long subjectId) {
        return questionRepository.findQuestionsBySubjectId(subjectId).stream().map(question -> modelMapper.map(question, QuestionDto.class)).toList();
    }

    @Override
    public List<QuestionDto> getQuestionsBySubjectAndNumber(Long subjectId, int number) {
        List<Question> questions = questionRepository.findRandomQuestionsBySubject(subjectId, number);

        // Chuyển đổi từ Entity sang DTO
        return questions.stream()
                .map(question -> modelMapper.map(question, QuestionDto.class))
                .toList();
    }

    @Override
    public List<QuestionDto> getQuestionsBySubjectAndDifficulty(Long subjectId, int number, String difficulty) {
        // Lấy câu hỏi từ repository
        List<Question> questions = questionRepository.findQuestionsBySubjectAndDifficulty(subjectId, difficulty, number);

        // Chuyển đổi từ Entity sang DTO
        return questions.stream()
                .map(question -> modelMapper.map(question, QuestionDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<QuestionDto> getQuestionsByChapter(Long chapterId, int number) {
        // Lấy câu hỏi từ repository
        List<Question> questions = questionRepository.findQuestionsByChapter(chapterId, number);

        // Chuyển đổi từ Entity sang DTO
        return questions.stream()
                .map(question -> modelMapper.map(question, QuestionDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<QuestionDto> getQuestionsByExamId(Long examId) {
        List<Question> questions = questionRepository.findQuestionsByExamId(examId);

        // Sử dụng ModelMapper để chuyển đổi từ Entity sang DTO
        return questions.stream()
                .map(question -> modelMapper.map(question, QuestionDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public void importQuestionsFromExcel(MultipartFile file, Long categoryId, Long subjectId, Long chapterId) throws IOException {
        validateImportTarget(subjectId, chapterId);
        questionImportService.importQuestions(file, chapterId);
    }

    @Override
    public ImportPreviewResponse previewImportQuestions(MultipartFile file, Long categoryId, Long subjectId, Long chapterId) throws IOException {
        validateImportTarget(subjectId, chapterId);
        return questionImportService.previewImport(file);
    }

    private void validateImportTarget(Long subjectId, Long chapterId) {
        Long chapterSubjectId = chapterRepository.findSubjectIdByChapterId(chapterId)
                .orElseThrow(() -> new CustomApiException("Chapter not found", HttpStatus.NOT_FOUND));
        if (!chapterSubjectId.equals(subjectId)) {
            throw new CustomApiException("Access denied", HttpStatus.FORBIDDEN);
        }
    }

    @Override
    @Transactional
    public QuestionDto create(QuestionDto questionDto) {
        Chapter chapter = chapterRepository.findById(questionDto.getChapterId())
                .orElseThrow(() -> new CustomApiException("Chapter not found", HttpStatus.NOT_FOUND));

        Question question = questionMapper.toEntity(questionDto, chapter);
        question = questionRepository.save(question);

        return modelMapper.map(question, QuestionDto.class);
    }

    @Override
    @Transactional
    public QuestionDto update(Long questionId, QuestionDto questionDto) {
        // Tìm câu hỏi hiện tại
        var existingQuestion = questionRepository.findById(questionId)
                .orElseThrow(() -> new CustomApiException("Question not found", HttpStatus.NOT_FOUND));

        questionMapper.updateEntity(existingQuestion, questionDto);

        // Cập nhật danh sách câu trả lời
        if (questionDto.getAnswers() != null) {
            // Xóa các câu trả lời cũ
            answerRepository.deleteAll(existingQuestion.getAnswers());
            existingQuestion.getAnswers().clear();

            existingQuestion.getAnswers().addAll(questionMapper.toAnswers(questionDto.getAnswers(), existingQuestion));
        }
        // Lưu câu hỏi đã cập nhật
        Question question = questionRepository.save(existingQuestion);

        // Trả về phản hồi
        return modelMapper.map(question, QuestionDto.class);
    }

    @Override
    public Response delete(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new CustomApiException("Question not found", HttpStatus.NOT_FOUND));

        if (Boolean.TRUE.equals(question.getDeleted())) {
            return Response.builder()
                    .responseMessage("Question already deleted")
                    .responseCode("200 OK").build();
        }

        question.setDeleted(true);
        question.setDeletedAt(LocalDateTime.now());
        question.setDeletedBy(null);
        questionRepository.save(question);

        return Response.builder()
                .responseMessage("Question soft deleted successfully")
                .responseCode("200 OK").build();
    }

    @Override
    public QuestionDto restore(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new CustomApiException("Question not found", HttpStatus.NOT_FOUND));

        question.setDeleted(false);
        question.setDeletedAt(null);
        question.setDeletedBy(null);

        Question restoredQuestion = questionRepository.save(question);
        return modelMapper.map(restoredQuestion, QuestionDto.class);
    }

    @Override
    public Map<String, Object> totalQuestionBySubject(Long subjectId) {
        List<Chapter> chapters = chapterRepository.findBySubject(subjectId);
        int totalQuestion = 0, totalMedium = 0, totalEasy = 0, totalHard = 0;
        Map<Long, Map<String, Object>> totalQuestionByChapter = new HashMap<>();

        for (Chapter chapter : chapters) {
            Map<String, Object> chapterDetails = new HashMap<>();
            chapterDetails.put("chapterName", chapter.getName());
            chapterDetails.put("totalQuestions", 0);
            chapterDetails.put("medium", 0);
            chapterDetails.put("easy", 0);
            chapterDetails.put("hard", 0);
            totalQuestionByChapter.put(chapter.getChapterId(), chapterDetails);
        }

        List<Object[]> counts = questionRepository.countQuestionsBySubjectGroupedByChapterAndDifficulty(subjectId);

        for (Object[] row : counts) {
            Long chapterId = (Long) row[0];
            Question.Difficulty difficulty = (Question.Difficulty) row[1];
            int count = ((Long) row[2]).intValue();

            Map<String, Object> chapterDetails = totalQuestionByChapter.get(chapterId);
            if (chapterDetails != null) {
                int chapterTotal = (int) chapterDetails.get("totalQuestions") + count;
                chapterDetails.put("totalQuestions", chapterTotal);

                if (difficulty == Question.Difficulty.MEDIUM) {
                    chapterDetails.put("medium", count);
                    totalMedium += count;
                } else if (difficulty == Question.Difficulty.EASY) {
                    chapterDetails.put("easy", count);
                    totalEasy += count;
                } else if (difficulty == Question.Difficulty.HARD) {
                    chapterDetails.put("hard", count);
                    totalHard += count;
                }
                totalQuestion += count;
            }
        }

        return Map.of(
                "totalQuestion", totalQuestion,
                "totalMedium", totalMedium,
                "totalEasy", totalEasy,
                "totalHard", totalHard,
                "totalQuestionByChapter", totalQuestionByChapter
        );
    }
}
