package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.dto.response.SharedDocumentResponse;
import com.fita.vnua.quiz.model.entity.SharedDocument;
import com.fita.vnua.quiz.service.SharedDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SharedDocumentController {

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

    private final SharedDocumentService documentService;

    @GetMapping("/api/v1/public/documents")
    public ResponseEntity<ApiResponse<List<SharedDocumentResponse>>> getPublicDocuments() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tài liệu thành công", documentService.getPublicDocuments()));
    }

    @GetMapping("/api/v1/public/documents/{id}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) throws IOException {
        SharedDocument document = documentService.getDownloadableDocument(id);
        Resource resource = documentService.loadFile(document);
        String filename = UriUtils.encode(document.getOriginalFilename(), StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(getSafeContentType(document)))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + filename)
                .body(resource);
    }

    @GetMapping("/api/v1/admin/documents")
    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'DOCUMENT', 'VIEW', 'GLOBAL', null)")
    public ResponseEntity<ApiResponse<List<SharedDocumentResponse>>> getAdminDocuments() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tài liệu quản trị thành công", documentService.getAdminDocuments()));
    }

    @PostMapping(value = "/api/v1/admin/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'DOCUMENT', 'CREATE', 'GLOBAL', null)")
    public ResponseEntity<ApiResponse<SharedDocumentResponse>> createDocument(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "active", defaultValue = "true") boolean active,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return ResponseEntity.ok(ApiResponse.success("Tải tài liệu lên thành công", documentService.create(title, description, active, file)));
    }

    @PatchMapping("/api/v1/admin/documents/{id}")
    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'DOCUMENT', 'UPDATE', 'GLOBAL', null)")
    public ResponseEntity<ApiResponse<SharedDocumentResponse>> updateDocument(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "active", required = false) Boolean active
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tài liệu thành công", documentService.update(id, title, description, active)));
    }

    @DeleteMapping("/api/v1/admin/documents/{id}")
    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'DOCUMENT', 'DELETE', 'GLOBAL', null)")
    public ResponseEntity<ApiResponse<Object>> deleteDocument(@PathVariable Long id) throws IOException {
        documentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa tài liệu thành công", null));
    }

    private String getSafeContentType(SharedDocument document) {
        String filename = document.getOriginalFilename();
        if (filename == null) {
            return "application/octet-stream";
        }
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            return "application/octet-stream";
        }
        String extension = filename.substring(dotIndex + 1).toLowerCase();
        return CONTENT_TYPES_BY_EXTENSION.getOrDefault(extension, "application/octet-stream");
    }
}
