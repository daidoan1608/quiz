package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.AnswerDto;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.model.entity.Answer;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.model.entity.Subject;
import com.fita.vnua.quiz.repository.AnswerRepository;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.service.QuestionService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

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
    public List<QuestionDto> getQuestionsByExamId(Long examId) {
        List<Question> questions = questionRepository.findQuestionsByExamId(examId);

        // Sử dụng ModelMapper để chuyển đổi từ Entity sang DTO
        return questions.stream()
                .map(question -> modelMapper.map(question, QuestionDto.class))
                .collect(Collectors.toList());
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
        int totalQuestion = 0,totalMedium = 0,totalEasy = 0,totalHard = 0;
        Map<String,Integer> tolalQuestionByChapter = new java.util.HashMap<>(Map.of());
        for (Chapter chapter : chapters) {
            tolalQuestionByChapter.put(chapter.getName(),(int)questionRepository.countByChapter(chapter));
            totalQuestion += questionRepository.countByChapter(chapter);
            totalMedium += (int)questionRepository.countByChapterAndDifficulty(chapter, Question.Difficulty.MEDIUM);
            totalEasy += (int)questionRepository.countByChapterAndDifficulty(chapter, Question.Difficulty.EASY);
            totalHard += (int)questionRepository.countByChapterAndDifficulty(chapter, Question.Difficulty.HARD);
        }
        return Map.of("totalQuestion", totalQuestion, "totalMedium", totalMedium, "totalEasy", totalEasy, "totalHard", totalHard, "totalQuestionByChapter", tolalQuestionByChapter);
    }
}
