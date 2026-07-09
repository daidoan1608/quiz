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

import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipEntry;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
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
    @Transactional
    public void importQuestionsFromExcel(MultipartFile file, Long categoryId, Long subjectId, Long chapterId) throws IOException {
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();

        List<QuestionDto> dtos;
        Map<String, byte[]> imagesMap = new HashMap<>();

        if ((contentType != null && contentType.equals("application/zip")) || (originalFilename != null && originalFilename.endsWith(".zip"))) {
            // Đọc file nén ZIP
            try (ZipInputStream zis = new ZipInputStream(file.getInputStream())) {
                ZipEntry entry;
                byte[] excelBytes = null;

                while ((entry = zis.getNextEntry()) != null) {
                    if (entry.isDirectory()) {
                        continue;
                    }
                    String name = entry.getName();
                    String simpleName = Paths.get(name).getFileName().toString();

                    if (simpleName.endsWith(".xlsx")) {
                        excelBytes = zis.readAllBytes();
                    } else if (isImageFile(simpleName)) {
                        byte[] imageBytes = zis.readAllBytes();
                        imagesMap.put(simpleName.toLowerCase(), imageBytes);
                    }
                }

                if (excelBytes == null) {
                    throw new RuntimeException("Không tìm thấy file Excel (.xlsx) trong file nén ZIP!");
                }

                try (ByteArrayInputStream bais = new ByteArrayInputStream(excelBytes)) {
                    dtos = ExcelHelper.excelToQuestions(bais);
                }
            } catch (Exception e) {
                throw new RuntimeException("Lỗi giải nén và xử lý file ZIP: " + e.getMessage(), e);
            }
        } else {
            // Đọc file Excel thông thường
            dtos = ExcelHelper.excelToQuestions(file.getInputStream());
        }

        // Tìm chapter trước
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter không tồn tại"));

        // Chuyển từng DTO thành entity Question
        List<Question> questions = new ArrayList<>();
        for (QuestionDto dto : dtos) {
            Question question = new Question();
            question.setContent(dto.getContent());

            try {
                question.setDifficulty(Question.Difficulty.valueOf(dto.getDifficulty().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Difficulty không hợp lệ: " + dto.getDifficulty());
            }

            question.setChapter(chapter);

            // Gán loại câu hỏi
            question.setQuestionType(dto.getQuestionType() != null ?
                    Question.QuestionType.valueOf(dto.getQuestionType().toUpperCase()) :
                    Question.QuestionType.SINGLE_CHOICE);

            // Xử lý hình ảnh
            String imgName = dto.getImageUrl();
            if (imgName != null && !imgName.trim().isEmpty()) {
                byte[] imgBytes = imagesMap.get(imgName.trim().toLowerCase());
                if (imgBytes != null) {
                    String savedUrl = saveQuestionImage(imgName.trim(), imgBytes);
                    question.setImageUrl(savedUrl);
                } else {
                    // Nếu là đường dẫn ngoài (http://...) thì lưu trực tiếp
                    if (imgName.startsWith("http://") || imgName.startsWith("https://") || imgName.startsWith("/")) {
                        question.setImageUrl(imgName);
                    }
                }
            }

            // Tạo danh sách answer cho question
            List<Answer> answers = dto.getAnswers().stream().map(ansDto -> {
                Answer answer = new Answer();
                answer.setContent(ansDto.getContent());
                answer.setIsCorrect(ansDto.getIsCorrect());
                answer.setQuestion(question);
                return answer;
            }).collect(Collectors.toList());

            question.setAnswers(answers);
            questions.add(question);
        }

        // Lưu tất cả câu hỏi cùng lúc
        questionRepository.saveAll(questions);
    }

    private boolean isImageFile(String filename) {
        String lower = filename.toLowerCase();
        return lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif") || lower.endsWith(".webp");
    }

    private String saveQuestionImage(String originalName, byte[] bytes) {
        try {
            Path folder = Paths.get("uploads/questions").toAbsolutePath().normalize();
            Files.createDirectories(folder);

            String ext = "";
            int dotIdx = originalName.lastIndexOf(".");
            if (dotIdx != -1) {
                ext = originalName.substring(dotIdx);
            }
            String filename = "q_" + UUID.randomUUID() + ext;
            Path target = folder.resolve(filename);
            Files.write(target, bytes);

            return "/questions/" + filename;
        } catch (Exception e) {
            log.error("Lỗi khi lưu ảnh câu hỏi từ ZIP: {}", e.getMessage());
            return null;
        }
    }



    @Override
    @Transactional
    public QuestionDto create(QuestionDto questionDto) {
        Question question = new Question();
        question.setContent(questionDto.getContent());
        question.setDifficulty(Question.Difficulty.valueOf(questionDto.getDifficulty().toUpperCase()));
        question.setImageUrl(questionDto.getImageUrl());
        question.setQuestionType(questionDto.getQuestionType() != null ?
                Question.QuestionType.valueOf(questionDto.getQuestionType().toUpperCase()) :
                Question.QuestionType.SINGLE_CHOICE);

        // Gán chapter cho question
        Chapter chapter = chapterRepository.findById(questionDto.getChapterId())
                .orElseThrow(() -> new RuntimeException("Chapter not found"));
        question.setChapter(chapter);

        // Kiểm tra danh sách câu trả lời
        if (questionDto.getAnswers() != null && !questionDto.getAnswers().isEmpty()) {
            List<Answer> answers = new ArrayList<>();
            for (AnswerDto answerDto : questionDto.getAnswers()) {
                Answer answer = new Answer();
                answer.setContent(answerDto.getContent());
                answer.setIsCorrect(answerDto.getIsCorrect());
                answer.setQuestion(question);
                answers.add(answer);
            }
            question.setAnswers(answers);
        }

        // Lưu đối tượng Question một lần duy nhất (các Answer sẽ tự động được lưu do CascadeType.ALL)
        question = questionRepository.save(question);

        return modelMapper.map(question, QuestionDto.class);
    }

    @Override
    @Transactional
    public QuestionDto update(Long questionId, QuestionDto questionDto) {
        // Tìm câu hỏi hiện tại
        var existingQuestion = questionRepository.findById(questionId)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));

        // Cập nhật thông tin của câu hỏi
        existingQuestion.setContent(questionDto.getContent());
        existingQuestion.setDifficulty(Question.Difficulty.valueOf(questionDto.getDifficulty().toUpperCase()));
        existingQuestion.setImageUrl(questionDto.getImageUrl());
        existingQuestion.setQuestionType(questionDto.getQuestionType() != null ?
                Question.QuestionType.valueOf(questionDto.getQuestionType().toUpperCase()) :
                Question.QuestionType.SINGLE_CHOICE);

        // Cập nhật danh sách câu trả lời
        if (questionDto.getAnswers() != null) {
            // Xóa các câu trả lời cũ
            answerRepository.deleteAll(existingQuestion.getAnswers());
            existingQuestion.getAnswers().clear();

            // Lưu các câu trả lời mới
            List<Answer> newAnswers = new ArrayList<>();
            for (AnswerDto answerDto : questionDto.getAnswers()) {
                Answer answer = new Answer();
                answer.setContent(answerDto.getContent());
                answer.setIsCorrect(answerDto.getIsCorrect());
                answer.setQuestion(existingQuestion); // Gắn câu hỏi vào câu trả lời
                newAnswers.add(answer);
            }
            existingQuestion.getAnswers().addAll(newAnswers);
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
