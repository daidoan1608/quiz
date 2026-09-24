package com.fita.vnua.quiz.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.ai.GenerateQuestionsResponse;
import com.fita.vnua.quiz.model.dto.ai.GeneratedAnswerDto;
import com.fita.vnua.quiz.model.dto.ai.GeneratedQuestionDto;
import com.fita.vnua.quiz.model.entity.Answer;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.model.enums.QuestionDifficulty;
import com.fita.vnua.quiz.model.enums.QuestionType;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.service.AiQuestionGeneratorService;
import com.fita.vnua.quiz.service.ai.AiClient;
import com.fita.vnua.quiz.service.ai.AiClientRouter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiQuestionGeneratorServiceImpl implements AiQuestionGeneratorService {

    private final AiClientRouter aiClientRouter;
    private final ChapterRepository chapterRepository;
    private final QuestionRepository questionRepository;
    private final ObjectMapper objectMapper;

    private static final int MAX_EXTRACTED_CHARS = 12000;
    private static final int DEFAULT_QUESTIONS_COUNT = 5;
    private static final int MAX_QUESTIONS_COUNT = 20;

    @Override
    @Transactional
    public GenerateQuestionsResponse generateQuestionsFromFile(
            MultipartFile file,
            Long chapterId,
            Integer numberOfQuestions,
            QuestionDifficulty difficulty,
            Boolean saveToDatabase,
            User currentUser
    ) {
        if (currentUser == null || currentUser.getUserId() == null) {
            throw new CustomApiException("UNAUTHORIZED", "Vui lòng đăng nhập để sử dụng tính năng này.",
                    HttpStatus.UNAUTHORIZED);
        }

        if (file == null || file.isEmpty()) {
            throw new CustomApiException("BAD_REQUEST", "Vui lòng tải lên file tài liệu hợp lệ (PDF, DOCX hoặc TXT).",
                    HttpStatus.BAD_REQUEST);
        }

        int count = (numberOfQuestions == null || numberOfQuestions <= 0) ? DEFAULT_QUESTIONS_COUNT : numberOfQuestions;
        if (count > MAX_QUESTIONS_COUNT) {
            count = MAX_QUESTIONS_COUNT;
        }

        boolean shouldSave = Boolean.TRUE.equals(saveToDatabase);
        Chapter chapter = null;
        if (shouldSave) {
            if (chapterId == null) {
                throw new CustomApiException("BAD_REQUEST", "Vui lòng chọn chapterId để lưu câu hỏi vào cơ sở dữ liệu.",
                        HttpStatus.BAD_REQUEST);
            }
            chapter = chapterRepository.findById(chapterId)
                    .orElseThrow(() -> new CustomApiException("NOT_FOUND", "Không tìm thấy chương với ID: " + chapterId,
                            HttpStatus.NOT_FOUND));
        }

        // 1. Trích xuất text từ tài liệu
        String documentText = extractTextFromFile(file);
        if (!StringUtils.hasText(documentText) || documentText.trim().length() < 30) {
            throw new CustomApiException("BAD_REQUEST", "Không thể trích xuất nội dung văn bản từ file hoặc tài liệu quá ngắn.",
                    HttpStatus.BAD_REQUEST);
        }

        if (documentText.length() > MAX_EXTRACTED_CHARS) {
            documentText = documentText.substring(0, MAX_EXTRACTED_CHARS);
        }

        // 2. Chuẩn bị Prompt cho AI
        String difficultyStr = (difficulty != null) ? difficulty.name() : "hỗn hợp (EASY, MEDIUM, HARD)";
        String systemPrompt = """
                Bạn là một chuyên gia khảo thí và sư phạm giàu kinh nghiệm.
                Nhiệm vụ của bạn là phân tích tài liệu được cung cấp và tạo ra các câu hỏi trắc nghiệm khách quan 4 lựa chọn (A, B, C, D) chất lượng cao bằng tiếng Việt.
                
                Yêu cầu bắt buộc:
                1. Mỗi câu hỏi phải có nội dung rõ ràng, bám sát kiến thức trong tài liệu.
                2. Mỗi câu hỏi có đúng 4 phương án trả lời: đúng 1 đáp án chính xác (isCorrect: true) và 3 đáp án nhiễu hợp lý (isCorrect: false).
                3. Có phần giải thích chi tiết (explanation) vì sao đáp án đó đúng.
                4. difficulty phải thuộc một trong 3 giá trị: EASY, MEDIUM, HARD.
                5. Định dạng đầu ra BẮT BUỘC là mảng JSON hợp lệ, KHÔNG bọc thêm lời giải thích hay văn bản nào khác ngoài JSON:
                [
                  {
                    "content": "Nội dung câu hỏi trắc nghiệm?",
                    "difficulty": "EASY",
                    "explanation": "Giải thích ngắn gọn và rõ ràng...",
                    "answers": [
                      { "content": "Nội dung lựa chọn 1", "isCorrect": true },
                      { "content": "Nội dung lựa chọn 2", "isCorrect": false },
                      { "content": "Nội dung lựa chọn 3", "isCorrect": false },
                      { "content": "Nội dung lựa chọn 4", "isCorrect": false }
                    ]
                  }
                ]
                """;

        String userPrompt = String.format("""
                Hãy tạo ra đúng %d câu hỏi trắc nghiệm từ tài liệu dưới đây với độ khó %s.
                
                --- NỘI DUNG TÀI LIỆU ---
                %s
                ------------------------
                """, count, difficultyStr, documentText);

        // 3. Gọi AI Client
        AiClient client = aiClientRouter.getActiveClient();
        log.info("Generating {} questions using AI provider: {}", count, client.getProviderName());
        String rawResponse = client.generateExplanation(systemPrompt, userPrompt);

        // 4. Parse JSON
        List<GeneratedQuestionDto> parsedQuestions = parseQuestionsFromJson(rawResponse, difficulty);

        // 5. Nếu có yêu cầu lưu vào Database
        int savedCount = 0;
        if (shouldSave && chapter != null) {
            savedCount = persistQuestions(parsedQuestions, chapter);
        }

        return GenerateQuestionsResponse.builder()
                .totalGenerated(parsedQuestions.size())
                .totalSaved(savedCount)
                .chapterId(chapterId)
                .fileName(file.getOriginalFilename())
                .provider(client.getProviderName())
                .questions(parsedQuestions)
                .build();
    }

    private String extractTextFromFile(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        }

        try {
            switch (extension) {
                case "pdf" -> {
                    try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                        PDFTextStripper stripper = new PDFTextStripper();
                        return stripper.getText(document);
                    }
                }
                case "docx" -> {
                    try (InputStream is = file.getInputStream();
                         XWPFDocument doc = new XWPFDocument(is);
                         XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                        return extractor.getText();
                    }
                }
                case "txt" -> {
                    return new String(file.getBytes(), StandardCharsets.UTF_8);
                }
                default -> throw new CustomApiException("BAD_REQUEST",
                        "Định dạng file không được hỗ trợ. Vui lòng tải file .pdf, .docx hoặc .txt",
                        HttpStatus.BAD_REQUEST);
            }
        } catch (CustomApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to extract text from file {}: {}", originalFilename, e.getMessage(), e);
            throw new CustomApiException("FILE_PARSE_ERROR", "Lỗi đọc file: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    private List<GeneratedQuestionDto> parseQuestionsFromJson(String rawResponse, QuestionDifficulty fallbackDifficulty) {
        String cleanJson = rawResponse.trim();
        if (cleanJson.startsWith("```json")) {
            cleanJson = cleanJson.substring(7);
        } else if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.substring(3);
        }
        if (cleanJson.endsWith("```")) {
            cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
        }
        cleanJson = cleanJson.trim();

        List<GeneratedQuestionDto> questions = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(cleanJson);
            if (!root.isArray()) {
                if (root.has("questions") && root.get("questions").isArray()) {
                    root = root.get("questions");
                } else {
                    throw new IllegalArgumentException("Expected a JSON array of questions");
                }
            }

            for (JsonNode qNode : root) {
                String content = qNode.path("content").asText("").trim();
                if (!StringUtils.hasText(content)) {
                    continue;
                }

                String diffStr = qNode.path("difficulty").asText("MEDIUM").toUpperCase();
                QuestionDifficulty diff;
                try {
                    diff = QuestionDifficulty.valueOf(diffStr);
                } catch (Exception ignored) {
                    diff = (fallbackDifficulty != null) ? fallbackDifficulty : QuestionDifficulty.MEDIUM;
                }

                String explanation = qNode.path("explanation").asText("").trim();

                List<GeneratedAnswerDto> answers = new ArrayList<>();
                JsonNode answersNode = qNode.path("answers");
                if (answersNode.isArray()) {
                    for (JsonNode aNode : answersNode) {
                        String ansContent = aNode.path("content").asText("").trim();
                        boolean isCorrect = aNode.path("isCorrect").asBoolean(false);
                        if (StringUtils.hasText(ansContent)) {
                            answers.add(GeneratedAnswerDto.builder()
                                    .content(ansContent)
                                    .isCorrect(isCorrect)
                                    .build());
                        }
                    }
                }

                // Đảm bảo ít nhất 1 đáp án đúng nếu AI quên đánh dấu
                if (!answers.isEmpty() && answers.stream().noneMatch(GeneratedAnswerDto::getIsCorrect)) {
                    answers.get(0).setIsCorrect(true);
                }

                questions.add(GeneratedQuestionDto.builder()
                        .content(content)
                        .difficulty(diff)
                        .explanation(explanation)
                        .answers(answers)
                        .build());
            }
        } catch (Exception e) {
            log.error("Failed to parse JSON questions from AI response: {}, raw: {}", e.getMessage(), rawResponse);
            throw new CustomApiException("AI_PARSE_ERROR", "Không thể phân tích định dạng câu hỏi do AI sinh ra.",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return questions;
    }

    private int persistQuestions(List<GeneratedQuestionDto> dtos, Chapter chapter) {
        int count = 0;
        for (GeneratedQuestionDto dto : dtos) {
            Question question = new Question();
            question.setContent(dto.getContent());
            question.setDifficulty(dto.getDifficulty());
            question.setChapter(chapter);
            question.setQuestionType(QuestionType.SINGLE_CHOICE);
            question.setExamEnabled(true);
            question.setPracticeEnabled(true);
            question.setDeleted(false);

            List<Answer> answers = new ArrayList<>();
            for (GeneratedAnswerDto aDto : dto.getAnswers()) {
                Answer answer = new Answer();
                answer.setContent(aDto.getContent());
                answer.setIsCorrect(aDto.getIsCorrect());
                answer.setQuestion(question);
                answers.add(answer);
            }
            question.setAnswers(answers);

            Question saved = questionRepository.save(question);
            dto.setSavedQuestionId(saved.getQuestionId());
            count++;
        }
        return count;
    }
}
