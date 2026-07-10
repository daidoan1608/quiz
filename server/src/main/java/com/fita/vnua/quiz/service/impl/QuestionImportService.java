package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.service.mapper.QuestionMapper;
import com.fita.vnua.quiz.utils.ExcelHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
@RequiredArgsConstructor
public class QuestionImportService {

    private final QuestionRepository questionRepository;
    private final ChapterRepository chapterRepository;
    private final AvatarStorageService avatarStorageService;
    private final QuestionMapper questionMapper;

    @Transactional
    public void importQuestions(MultipartFile file, Long chapterId) throws IOException {
        ImportedQuestionFile importedFile = readImportFile(file);
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new CustomApiException("Chapter không tồn tại", HttpStatus.NOT_FOUND));

        List<Question> questions = importedFile.questions().stream()
                .map(dto -> toQuestion(dto, chapter, importedFile.images()))
                .toList();

        questionRepository.saveAll(questions);
    }

    private ImportedQuestionFile readImportFile(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        boolean isZip = (contentType != null && contentType.equals("application/zip"))
                || (originalFilename != null && originalFilename.endsWith(".zip"));

        if (!isZip) {
            return new ImportedQuestionFile(ExcelHelper.excelToQuestions(file.getInputStream()), Map.of());
        }

        return readZipImportFile(file);
    }

    private ImportedQuestionFile readZipImportFile(MultipartFile file) throws IOException {
        Map<String, byte[]> images = new HashMap<>();
        byte[] excelBytes = null;

        try (ZipInputStream zipInputStream = new ZipInputStream(file.getInputStream())) {
            ZipEntry entry;
            while ((entry = zipInputStream.getNextEntry()) != null) {
                if (entry.isDirectory()) {
                    continue;
                }

                String simpleName = Paths.get(entry.getName()).getFileName().toString();
                if (simpleName.endsWith(".xlsx")) {
                    excelBytes = zipInputStream.readAllBytes();
                } else if (isImageFile(simpleName)) {
                    images.put(simpleName.toLowerCase(), zipInputStream.readAllBytes());
                }
            }
        } catch (Exception e) {
            throw new CustomApiException("Lỗi giải nén và xử lý file ZIP: " + e.getMessage(), e);
        }

        if (excelBytes == null) {
            throw new CustomApiException("Không tìm thấy file Excel (.xlsx) trong file nén ZIP!", HttpStatus.BAD_REQUEST);
        }

        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(excelBytes)) {
            return new ImportedQuestionFile(ExcelHelper.excelToQuestions(inputStream), images);
        }
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

    private record ImportedQuestionFile(List<QuestionDto> questions, Map<String, byte[]> images) {
    }
}
