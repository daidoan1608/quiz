package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.enums.QuestionType;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.AnswerDto;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.response.ImportPreviewResponse;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.service.AvatarStorageService;
import com.fita.vnua.quiz.service.mapper.QuestionMapper;
import com.fita.vnua.quiz.utils.ExcelHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
@RequiredArgsConstructor
public class QuestionImportService {
    private static final int MIN_ANSWERS = 2;
    private static final int MAX_ANSWERS = 8;
    private static final long MAX_IMPORT_FILE_SIZE_BYTES = 20L * 1024 * 1024;
    private static final long MAX_UNZIPPED_BYTES = 50L * 1024 * 1024;
    private static final long MAX_SPREADSHEET_BYTES = 10L * 1024 * 1024;
    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
    private static final int MAX_ZIP_ENTRIES = 100;
    private static final int MAX_IMAGE_FILES = 40;

    private final QuestionRepository questionRepository;
    private final ChapterRepository chapterRepository;
    private final AvatarStorageService avatarStorageService;
    private final QuestionMapper questionMapper;

    @Transactional
    public void importQuestions(MultipartFile file, Long chapterId) throws IOException {
        ImportedQuestionFile importedFile = readImportFile(file);
        ImportPreviewResponse preview = buildPreview(importedFile);
        if (preview.getInvalidRows() > 0) {
            throw new CustomApiException("File import còn lỗi: " + String.join("; ", preview.getErrors()), HttpStatus.BAD_REQUEST);
        }
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new CustomApiException("Chương không tồn tại", HttpStatus.NOT_FOUND));

        if (Boolean.TRUE.equals(chapter.getDeleted())) {
            throw new CustomApiException("Chương không tồn tại", HttpStatus.NOT_FOUND);
        }

        List<Question> questions = importedFile.questions().stream()
                .map(dto -> toQuestion(dto, chapter, importedFile.images()))
                .toList();

        questionRepository.saveAll(questions);
    }

    public ImportPreviewResponse previewImport(MultipartFile file) throws IOException {
        return buildPreview(readImportFile(file));
    }

    private ImportPreviewResponse buildPreview(ImportedQuestionFile importedFile) {
        List<String> errors = new ArrayList<>();
        Set<Integer> invalidRows = new HashSet<>();
        Map<String, byte[]> images = importedFile.images();
        List<QuestionDto> questions = importedFile.questions();

        for (int i = 0; i < questions.size(); i++) {
            validateQuestion(questions.get(i), i + 2, images, errors, invalidRows);
        }

        return ImportPreviewResponse.builder()
                .totalRows(questions.size())
                .validRows(questions.size() - invalidRows.size())
                .invalidRows(invalidRows.size())
                .errors(errors)
                .build();
    }

    private ImportedQuestionFile readImportFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new CustomApiException("File import đang trống.", HttpStatus.BAD_REQUEST);
        }
        if (file.getSize() > MAX_IMPORT_FILE_SIZE_BYTES) {
            throw new CustomApiException("File import vượt quá dung lượng cho phép.", HttpStatus.BAD_REQUEST);
        }
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        boolean isZip = (contentType != null
                && (contentType.equals("application/zip") || contentType.equals("application/x-zip-compressed")))
                || (originalFilename != null && originalFilename.toLowerCase().endsWith(".zip"));

        if (!isZip) {
            return new ImportedQuestionFile(
                    ExcelHelper.importToQuestions(file.getInputStream(), originalFilename),
                    Map.of()
            );
        }

        return readZipImportFile(file);
    }

    private ImportedQuestionFile readZipImportFile(MultipartFile file) throws IOException {
        Map<String, byte[]> images = new HashMap<>();
        byte[] excelBytes = null;
        String excelFilename = null;
        long totalUnzippedBytes = 0;
        int entryCount = 0;
        int imageCount = 0;

        try (ZipInputStream zipInputStream = new ZipInputStream(file.getInputStream())) {
            ZipEntry entry;
            while ((entry = zipInputStream.getNextEntry()) != null) {
                entryCount++;
                if (entryCount > MAX_ZIP_ENTRIES) {
                    throw new CustomApiException("File ZIP có quá nhiều file.", HttpStatus.BAD_REQUEST);
                }
                if (entry.isDirectory()) {
                    continue;
                }

                String simpleName = Paths.get(entry.getName()).getFileName().toString();
                if (isSpreadsheetFile(simpleName)) {
                    excelBytes = readEntryBytes(zipInputStream, MAX_SPREADSHEET_BYTES);
                    totalUnzippedBytes += excelBytes.length;
                    if (totalUnzippedBytes > MAX_UNZIPPED_BYTES) {
                        throw new CustomApiException("Tổng dung lượng giải nén vượt quá giới hạn.", HttpStatus.BAD_REQUEST);
                    }
                    excelFilename = simpleName;
                } else if (isImageFile(simpleName)) {
                    imageCount++;
                    if (imageCount > MAX_IMAGE_FILES) {
                        throw new CustomApiException("File ZIP có quá nhiều ảnh.", HttpStatus.BAD_REQUEST);
                    }
                    byte[] imageBytes = readEntryBytes(zipInputStream, MAX_IMAGE_BYTES);
                    totalUnzippedBytes += imageBytes.length;
                    if (totalUnzippedBytes > MAX_UNZIPPED_BYTES) {
                        throw new CustomApiException("Tổng dung lượng giải nén vượt quá giới hạn.", HttpStatus.BAD_REQUEST);
                    }
                    images.put(entry.getName().toLowerCase(), imageBytes);
                    images.put(simpleName.toLowerCase(), imageBytes);
                } else {
                    byte[] ignoredBytes = readEntryBytes(zipInputStream, MAX_IMAGE_BYTES);
                    totalUnzippedBytes += ignoredBytes.length;
                    if (totalUnzippedBytes > MAX_UNZIPPED_BYTES) {
                        throw new CustomApiException("Tổng dung lượng giải nén vượt quá giới hạn.", HttpStatus.BAD_REQUEST);
                    }
                }
            }
        } catch (CustomApiException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomApiException("Lỗi giải nén và xử lý file ZIP: " + e.getMessage(), e);
        }

        if (excelBytes == null) {
            throw new CustomApiException("Không tìm thấy file Excel/CSV trong file nén ZIP!", HttpStatus.BAD_REQUEST);
        }

        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(excelBytes)) {
            return new ImportedQuestionFile(ExcelHelper.importToQuestions(inputStream, excelFilename), images);
        }
    }

    private byte[] readEntryBytes(InputStream inputStream, long maxBytes) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        long totalBytes = 0;
        int bytesRead;
        while ((bytesRead = inputStream.read(buffer)) != -1) {
            totalBytes += bytesRead;
            if (totalBytes > maxBytes) {
                throw new CustomApiException("File trong ZIP vượt quá dung lượng cho phép.", HttpStatus.BAD_REQUEST);
            }
            outputStream.write(buffer, 0, bytesRead);
        }
        return outputStream.toByteArray();
    }

    private boolean isSpreadsheetFile(String filename) {
        String lower = filename.toLowerCase();
        return lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".csv");
    }

    private Question toQuestion(QuestionDto dto, Chapter chapter, Map<String, byte[]> images) {
        return questionMapper.toEntity(dto, chapter, imageUrl -> resolveImageUrl(imageUrl, images));
    }

    private String resolveImageUrl(String imageNameOrUrl, Map<String, byte[]> images) {
        if (imageNameOrUrl == null || imageNameOrUrl.trim().isEmpty()) {
            return null;
        }

        String normalizedImage = imageNameOrUrl.trim();
        byte[] imageBytes = images.get(normalizedImage.toLowerCase());
        if (imageBytes == null) {
            imageBytes = images.get(getSimpleFileKey(normalizedImage));
        }
        if (imageBytes != null) {
            return saveQuestionImage(normalizedImage, imageBytes);
        }

        if (isExternalOrPublicUrl(normalizedImage)) {
            return normalizedImage;
        }

        return null;
    }

    private String saveQuestionImage(String imageName, byte[] imageBytes) {
        try {
            return avatarStorageService.saveQuestionImage(imageName, imageBytes).getUrl();
        } catch (Exception e) {
            throw new CustomApiException("Lỗi khi lưu ảnh câu hỏi: " + e.getMessage(), e);
        }
    }

    private boolean isImageFile(String filename) {
        String lower = filename.toLowerCase();
        return lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")
                || lower.endsWith(".gif") || lower.endsWith(".webp");
    }

    private boolean isExternalOrPublicUrl(String value) {
        return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/");
    }

    private void validateQuestion(
            QuestionDto question,
            int rowNumber,
            Map<String, byte[]> images,
            List<String> errors,
            Set<Integer> invalidRows
    ) {
        if (question.getContent() == null || question.getContent().trim().isEmpty()) {
            addRowError(errors, invalidRows, rowNumber, "nội dung câu hỏi đang trống.");
        }

        String difficulty = question.getDifficulty();
        if (difficulty == null || difficulty.isBlank()) {
            addRowError(errors, invalidRows, rowNumber, "chưa có mức độ.");
        }

        List<AnswerDto> answers = question.getAnswers();
        if (answers == null || answers.size() < MIN_ANSWERS || answers.size() > MAX_ANSWERS) {
            addRowError(errors, invalidRows, rowNumber, "cần có từ 2 đến 8 đáp án.");
        } else {
            long correctCount = answers.stream().filter(answer -> Boolean.TRUE.equals(answer.getIsCorrect())).count();
            if (correctCount == 0) {
                addRowError(errors, invalidRows, rowNumber, "chưa chọn đáp án đúng.");
            }
            String questionType = question.getQuestionType() == null || question.getQuestionType().isBlank()
                    ? "SINGLE_CHOICE"
                    : question.getQuestionType().trim().toUpperCase();
            if ("SINGLE_CHOICE".equals(questionType) && correctCount > 1) {
                addRowError(errors, invalidRows, rowNumber, "SINGLE_CHOICE chỉ được có 1 đáp án đúng.");
            }
            if ("MULTIPLE_CHOICE".equals(questionType) && correctCount < 2) {
                addRowError(errors, invalidRows, rowNumber, "MULTIPLE_CHOICE cần ít nhất 2 đáp án đúng.");
            }
            if (!"SINGLE_CHOICE".equals(questionType) && !"MULTIPLE_CHOICE".equals(questionType)) {
                addRowError(errors, invalidRows, rowNumber, "questionType không hợp lệ: " + questionType + ".");
            }
            for (int index = 0; index < answers.size(); index++) {
                String answerContent = answers.get(index).getContent();
                if (answerContent == null || answerContent.trim().isEmpty()) {
                    addRowError(errors, invalidRows, rowNumber, "đáp án " + (char) ('A' + index) + " đang trống.");
                }
            }
        }

        String imageUrl = question.getImageUrl();
        if (imageUrl != null && !imageUrl.isBlank()) {
            String normalizedImage = imageUrl.trim();
            boolean foundInZip = images.containsKey(normalizedImage.toLowerCase())
                    || images.containsKey(getSimpleFileKey(normalizedImage));
            if (!foundInZip && !isExternalOrPublicUrl(normalizedImage)) {
                addRowError(errors, invalidRows, rowNumber, "không tìm thấy ảnh '" + normalizedImage + "' trong ZIP.");
            }
        }
    }

    private String getSimpleFileKey(String value) {
        String normalized = value.replace("\\", "/");
        int slashIndex = normalized.lastIndexOf('/');
        return (slashIndex >= 0 ? normalized.substring(slashIndex + 1) : normalized).toLowerCase();
    }

    private void addRowError(List<String> errors, Set<Integer> invalidRows, int rowNumber, String message) {
        invalidRows.add(rowNumber);
        errors.add("Dòng " + rowNumber + ": " + message);
    }

    private record ImportedQuestionFile(List<QuestionDto> questions, Map<String, byte[]> images) {
    }
}
