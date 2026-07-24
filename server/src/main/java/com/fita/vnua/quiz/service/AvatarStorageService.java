package com.fita.vnua.quiz.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface AvatarStorageService {

    Uploaded saveAvatar(UUID userId, MultipartFile file, String oldUrl) throws Exception;

    void deleteAvatar(String url);

    String getDefaultUrl();

    Uploaded saveQuestionImage(MultipartFile file) throws Exception;

    Uploaded saveQuestionImage(String originalName, byte[] bytes) throws Exception;

    @Data
    @AllArgsConstructor
    class Uploaded {
        private String filename;
        private String url;
    }
}
