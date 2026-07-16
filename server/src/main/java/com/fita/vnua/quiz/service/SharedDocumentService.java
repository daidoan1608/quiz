package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.response.SharedDocumentResponse;
import com.fita.vnua.quiz.model.entity.SharedDocument;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface SharedDocumentService {
    List<SharedDocumentResponse> getPublicDocuments();

    List<SharedDocumentResponse> getAdminDocuments();

    SharedDocumentResponse create(String title, String description, boolean active, MultipartFile file) throws IOException;

    SharedDocumentResponse update(Long id, String title, String description, Boolean active);

    void delete(Long id) throws IOException;

    SharedDocument getDownloadableDocument(Long id);

    Resource loadFile(SharedDocument document) throws IOException;
}
