package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.AnswerDto;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.model.entity.Answer;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.repository.AnswerRepository;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.service.QuestionService;
import com.fita.vnua.quiz.utils.ExcelHelper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {
    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;
    private final AnswerRepository answerRepository;
    private final ChapterRepository chapterRepository;
    private final ModelMapper modelMapper;


    @Override
    public Optional<QuestionDto> getQuestionById(Long questionId) {
        return questionRepository.findById(questionId).map(question -> modelMapper.map(question, QuestionDto.class));
    }

    @Override
    public List<QuestionDto> getQuestionsByChapterId(Long chapterId) {
        return questionRepository.findByChapter(chapterId).stream().map(question -> modelMapper.map(question, QuestionDto.class)).toList();
    }

    @Override
    public List<QuestionDto> getAllQuestion() {
        return questionRepository.findAll().stream().map(question -> modelMapper.map(question, QuestionDto.class)).toList();
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
        // Đọc dữ liệu từ file Excel và chuyển thành danh sách DTO câu hỏi
        List<QuestionDto> dtos = ExcelHelper.excelToQuestions(file.getInputStream());

        // Tìm chapter trước, tránh lặp lại tìm nhiều lần trong map
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter không tồn tại"));

        // Chuyển từng DTO thành entity Question
        List<Question> questions = dtos.stream().map(dto -> {
            Question question = new Question();
            question.setContent(dto.getContent());

            // Chuyển String difficulty sang enum, xử lý ngoại lệ nếu cần
            try {
                question.setDifficulty(Question.Difficulty.valueOf(dto.getDifficulty().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Difficulty không hợp lệ: " + dto.getDifficulty());
            }

            question.setChapter(chapter);

            // Tạo danh sách answer cho question
            List<Answer> answers = dto.getAnswers().stream().map(ansDto -> {
                Answer answer = new Answer();
                answer.setContent(ansDto.getContent());
                answer.setIsCorrect(ansDto.getIsCorrect());
                answer.setQuestion(question);
                return answer;
            }).collect(Collectors.toList());

            question.setAnswers(answers);

            return question;
        }).collect(Collectors.toList());
        // Lưu tất cả câu hỏi cùng lúc
        questionRepository.saveAll(questions);
    }



    @Override
    public QuestionDto create(QuestionDto questionDto) {
        Question question = new Question();
        question.setContent(questionDto.getContent());
        question.setDifficulty(Question.Difficulty.valueOf(questionDto.getDifficulty()));

        // Gán chapter cho question
        Chapter chapter = chapterRepository.findById(questionDto.getChapterId())
                .orElseThrow(() -> new RuntimeException("Chapter not found"));
        question.setChapter(chapter);

        // Kiểm tra danh sách câu trả lời
        if (questionDto.getAnswers() != null && !questionDto.getAnswers().isEmpty()) {
            for (AnswerDto answerDto : questionDto.getAnswers()) {
                Answer answer = new Answer();
                answer.setContent(answerDto.getContent());
                answer.setIsCorrect(answerDto.getIsCorrect());

                // Gán Question cho Answer
                answer.setQuestion(question);
            }
        }

        // Lưu đối tượng Question (các Answer sẽ tự động được lưu do CascadeType.ALL)
        question = questionRepository.save(question); // ID sẽ được gán tại đây
        modelMapper.map(question, questionDto);
        // Lưu các Answer sau khi Question đã có ID
        if (questionDto.getAnswers() != null && !questionDto.getAnswers().isEmpty()) {
            for (AnswerDto answerDto : questionDto.getAnswers()) {
                Answer answer = new Answer();
                answer.setContent(answerDto.getContent());
                answer.setIsCorrect(answerDto.getIsCorrect());

                // Gán Question cho Answer
                answer.setQuestion(question);
                // Lưu Answer vào database
                answerRepository.save(answer);
            }
        }

        return questionDto;
    }

    @Override
    public QuestionDto update(Long questionId, QuestionDto questionDto) {
        // Tìm câu hỏi hiện tại
        var existingQuestion = questionRepository.findById(questionId)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));

        // Cập nhật thông tin của câu hỏi
        String newContent = questionDto.getContent();
        existingQuestion.setContent(newContent);

        // Cập nhật danh sách câu trả lời
        if (questionDto.getAnswers() != null) {
            // Xóa các câu trả lời cũ
            answerRepository.deleteAll(existingQuestion.getAnswers());

            // Lưu các câu trả lời mới
            for (AnswerDto answerDto : questionDto.getAnswers()) {
                Answer answer = modelMapper.map(answerDto, Answer.class);
                answer.setQuestion(existingQuestion); // Gắn câu hỏi vào câu trả lời
                answerRepository.save(answer);
            }
        }
        // Lưu câu hỏi đã cập nhật
        Question question = questionRepository.save(existingQuestion);

        // Trả về phản hồi
        return modelMapper.map(question, QuestionDto.class);
    }

    @Override
    public Response delete(Long questionId) {
        // Tìm kiếm câu hỏi theo ID
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));

        // Xóa câu hỏi (cùng với tất cả câu trả lời nhờ cascade)
        questionRepository.delete(question);

        // Trả về phản hồi
        return Response.builder()
                .responseMessage("Question deleted successfully")
                .responseCode("200 OK").build();
    }

    @Override
    public Map<String, Object> totalQuestionBySubject(Long subjectId) {
        List<Chapter> chapters = chapterRepository.findBySubject(subjectId);
        int totalQuestion = 0, totalMedium = 0, totalEasy = 0, totalHard = 0;
        Map<Long, Map<String, Object>> totalQuestionByChapter = new HashMap<>();

        for (Chapter chapter : chapters) {
            // Kiểm tra xem có chapterId đã tồn tại trong totalQuestionByChapter chưa
            if (!totalQuestionByChapter.containsKey(chapter.getChapterId())) {
                totalQuestionByChapter.put(chapter.getChapterId(), new HashMap<>());
            }

            // Đặt tổng số câu hỏi cho chapter
            Map<String, Object> chapterDetails = totalQuestionByChapter.get(chapter.getChapterId());

            // Thêm tên chương vào Map
            chapterDetails.put("chapterName", chapter.getName());  // Thêm tên chương

            int chapterQuestionCount = (int) questionRepository.countByChapter(chapter);
            chapterDetails.put("totalQuestions", chapterQuestionCount);

            // Cập nhật tổng số câu hỏi
            totalQuestion += chapterQuestionCount;

            // Cập nhật tổng số câu theo độ khó
            int mediumCount = (int) questionRepository.countByChapterAndDifficulty(chapter, Question.Difficulty.MEDIUM);
            int easyCount = (int) questionRepository.countByChapterAndDifficulty(chapter, Question.Difficulty.EASY);
            int hardCount = (int) questionRepository.countByChapterAndDifficulty(chapter, Question.Difficulty.HARD);

            totalMedium += mediumCount;
            totalEasy += easyCount;
            totalHard += hardCount;

            // Lưu số lượng câu hỏi theo độ khó vào Map
            chapterDetails.put("medium", mediumCount);
            chapterDetails.put("easy", easyCount);
            chapterDetails.put("hard", hardCount);
        }

        // Trả về dữ liệu tổng hợp
        return Map.of(
                "totalQuestion", totalQuestion,
                "totalMedium", totalMedium,
                "totalEasy", totalEasy,
                "totalHard", totalHard,
                "totalQuestionByChapter", totalQuestionByChapter
        );
    }
}
