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
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SharedDocumentServiceImpl implements SharedDocumentService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "doc", "docx", "ppt", "pptx", "xls", "xlsx", "pdf", "txt", "csv", "zip", "rar"
    );
    private static final Map<String, String> CONTENT_TYPES_BY_EXTENSION = Map.ofEntries(
            Map.entry("doc", "application/msword"),
            Map.entry("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            Map.entry("ppt", "application/vnd.ms-powerpoint"),
            Map.entry("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
            Map.entry("xls", "application/vnd.ms-excel"),
            Map.entry("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
            Map.entry("pdf", "application/pdf"),
            Map.entry("txt", "text/plain"),
            Map.entry("csv", "text/csv"),
            Map.entry("zip", "application/zip"),
            Map.entry("rar", "application/vnd.rar")
    );

    private final SharedDocumentRepository repository;

    @Value("${document.upload-dir:uploads/documents}")
    private String documentUploadDir;

    @Value("${document.max-file-size-bytes:26214400}")
    private long documentMaxFileSizeBytes;

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
        if (file.getSize() > documentMaxFileSizeBytes) {
            throw new CustomApiException("File tài liệu vượt quá dung lượng cho phép", HttpStatus.BAD_REQUEST);
        }

        String originalFilename = Paths.get(file.getOriginalFilename() == null ? "document" : file.getOriginalFilename())
                .getFileName()
                .toString();
        String extension = getSafeExtension(originalFilename);
        validateFileSignature(extension, file);
        String contentType = getContentTypeForExtension(extension);
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
                .contentType(contentType)
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

    private String getContentTypeForExtension(String extension) {
        return CONTENT_TYPES_BY_EXTENSION.getOrDefault(extension, "application/octet-stream");
    }

    private void validateFileSignature(String extension, MultipartFile file) throws IOException {
        byte[] header = new byte[8];
        int length;
        try (InputStream inputStream = file.getInputStream()) {
            length = inputStream.read(header);
        }

        boolean valid = switch (extension) {
            case "pdf" -> startsWith(header, length, new byte[]{0x25, 0x50, 0x44, 0x46});
            case "zip", "docx", "pptx", "xlsx" -> startsWith(header, length, new byte[]{0x50, 0x4B});
            case "rar" -> startsWith(header, length, new byte[]{0x52, 0x61, 0x72, 0x21, 0x1A, 0x07});
            case "doc", "ppt", "xls" -> startsWith(header, length, new byte[]{(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0});
            case "txt", "csv" -> true;
            default -> false;
        };

        if (!valid) {
            throw new CustomApiException("Định dạng file tài liệu không hợp lệ", HttpStatus.BAD_REQUEST);
        }
    }

    private boolean startsWith(byte[] source, int sourceLength, byte[] prefix) {
        if (sourceLength < prefix.length) {
            return false;
        }
        for (int i = 0; i < prefix.length; i++) {
            if (source[i] != prefix[i]) {
                return false;
            }
        }
        return true;
    }

    private Path uploadRoot() {
        return Paths.get(documentUploadDir).toAbsolutePath().normalize();
    }
}
