package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.response.SharedDocumentResponse;
import com.fita.vnua.quiz.model.entity.SharedDocument;
import com.fita.vnua.quiz.repository.SharedDocumentRepository;
import com.fita.vnua.quiz.service.SharedDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SharedDocumentServiceImpl implements SharedDocumentService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "doc", "docx", "ppt", "pptx", "xls", "xlsx", "pdf", "txt", "csv", "zip", "rar"
    );

    private final SharedDocumentRepository repository;

    @Value("${document.upload-dir:uploads/documents}")
    private String documentUploadDir;

    @Override
    public List<SharedDocumentResponse> getPublicDocuments() {
        return repository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<SharedDocumentResponse> getAdminDocuments() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public SharedDocumentResponse create(String title, String description, boolean active, MultipartFile file) throws IOException {
        if (!StringUtils.hasText(title)) {
            throw new CustomApiException("Tiêu đề tài liệu là bắt buộc", HttpStatus.BAD_REQUEST);
        }
        if (file == null || file.isEmpty()) {
            throw new CustomApiException("Vui lòng chọn file tài liệu", HttpStatus.BAD_REQUEST);
        }

        String originalFilename = Paths.get(file.getOriginalFilename() == null ? "document" : file.getOriginalFilename())
                .getFileName()
                .toString();
        String extension = getSafeExtension(originalFilename);
        String storedFilename = UUID.randomUUID() + "." + extension;

        Path folder = uploadRoot();
        Files.createDirectories(folder);
        Path target = folder.resolve(storedFilename).normalize();
        if (!target.startsWith(folder)) {
            throw new CustomApiException("Đường dẫn file không hợp lệ", HttpStatus.BAD_REQUEST);
        }
        file.transferTo(target);

        SharedDocument document = SharedDocument.builder()
                .title(title.trim())
                .description(StringUtils.hasText(description) ? description.trim() : null)
                .originalFilename(originalFilename)
                .storedFilename(storedFilename)
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .active(active)
                .build();

        return toResponse(repository.save(document));
    }

    @Override
    public SharedDocumentResponse update(Long id, String title, String description, Boolean active) {
        SharedDocument document = repository.findById(id)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy tài liệu", HttpStatus.NOT_FOUND));

        if (StringUtils.hasText(title)) {
            document.setTitle(title.trim());
        }
        document.setDescription(StringUtils.hasText(description) ? description.trim() : null);
        if (active != null) {
            document.setActive(active);
        }

        return toResponse(repository.save(document));
    }

    @Override
    public void delete(Long id) throws IOException {
        SharedDocument document = repository.findById(id)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy tài liệu", HttpStatus.NOT_FOUND));
        Path filePath = uploadRoot().resolve(document.getStoredFilename()).normalize();
        if (filePath.startsWith(uploadRoot())) {
            Files.deleteIfExists(filePath);
        }
        repository.delete(document);
    }

    @Override
    public SharedDocument getDownloadableDocument(Long id) {
        SharedDocument document = repository.findById(id)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy tài liệu", HttpStatus.NOT_FOUND));
        if (!document.isActive()) {
            throw new CustomApiException("Tài liệu hiện không khả dụng", HttpStatus.NOT_FOUND);
        }
        return document;
    }

    @Override
    public Resource loadFile(SharedDocument document) throws IOException {
        try {
            Path filePath = uploadRoot().resolve(document.getStoredFilename()).normalize();
            if (!filePath.startsWith(uploadRoot())) {
                throw new CustomApiException("Đường dẫn file không hợp lệ", HttpStatus.BAD_REQUEST);
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new CustomApiException("Không thể đọc file tài liệu", HttpStatus.NOT_FOUND);
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new IOException("Đường dẫn tài liệu không hợp lệ", e);
        }
    }

    private SharedDocumentResponse toResponse(SharedDocument document) {
        return SharedDocumentResponse.builder()
                .id(document.getId())
                .title(document.getTitle())
                .description(document.getDescription())
                .originalFilename(document.getOriginalFilename())
                .contentType(document.getContentType())
                .fileSize(document.getFileSize())
                .active(document.isActive())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .downloadUrl("/api/v1/public/documents/" + document.getId() + "/download")
                .build();
    }

    private String getSafeExtension(String filename) {
        String extension = StringUtils.getFilenameExtension(filename);
        if (!StringUtils.hasText(extension)) {
            throw new CustomApiException("File phải có phần mở rộng hợp lệ", HttpStatus.BAD_REQUEST);
        }
        extension = extension.toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new CustomApiException("Định dạng tài liệu chưa được hỗ trợ", HttpStatus.BAD_REQUEST);
        }
        return extension;
    }

    private Path uploadRoot() {
        return Paths.get(documentUploadDir).toAbsolutePath().normalize();
    }
}
