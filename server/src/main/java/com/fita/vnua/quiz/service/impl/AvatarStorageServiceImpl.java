package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.service.storage.ImageStorage;
import com.fita.vnua.quiz.service.storage.ImageValidator;
import com.fita.vnua.quiz.service.storage.StoredImage;
import com.fita.vnua.quiz.service.AvatarStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AvatarStorageServiceImpl implements AvatarStorageService {

    private static final String AVATAR_PUBLIC_PATH = "/avatars/";
    private static final String QUESTION_PUBLIC_PATH = "/questions/";

    private final ImageStorage imageStorage;
    private final ImageValidator imageValidator;

    @Value("${avatar.upload-dir}")
    private String avatarUploadDir;

    @Value("${avatar.default-url}")
    private String defaultAvatarUrl;

    @Value("${question.upload-dir:uploads/questions}")
    private String questionUploadDir;

    @Override
    public Uploaded saveAvatar(UUID userId, MultipartFile file, String oldUrl) throws Exception {
        byte[] bytes = readAndValidate(file);
        deleteOldAvatar(oldUrl);

        String extension = imageValidator.getSafeExtension(file.getOriginalFilename());
        String filename = "avatar_" + userId + "_" + System.currentTimeMillis() + extension;

        return toUploaded(imageStorage.save(avatarUploadDir, AVATAR_PUBLIC_PATH, filename, bytes));
    }

    @Override
    public void deleteAvatar(String url) {
        try {
            imageStorage.delete(avatarUploadDir, AVATAR_PUBLIC_PATH, url);
        } catch (Exception e) {
            log.warn("Unable to delete old avatar: {}", url, e);
        }
    }

    @Override
    public String getDefaultUrl() {
        return defaultAvatarUrl;
    }

    @Override
    public Uploaded saveQuestionImage(MultipartFile file) throws Exception {
        byte[] bytes = readAndValidate(file);
        return saveQuestionImage(file.getOriginalFilename(), bytes);
    }

    @Override
    public Uploaded saveQuestionImage(String originalName, byte[] bytes) throws Exception {
        imageValidator.validate(originalName, null, bytes == null ? 0 : bytes.length, bytes);

        String extension = imageValidator.getSafeExtension(originalName);
        String filename = "q_" + UUID.randomUUID() + extension;

        return toUploaded(imageStorage.save(questionUploadDir, QUESTION_PUBLIC_PATH, filename, bytes));
    }

    private byte[] readAndValidate(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }

        byte[] bytes = file.getBytes();
        imageValidator.validate(file.getOriginalFilename(), file.getContentType(), file.getSize(), bytes);
        return bytes;
    }

    private void deleteOldAvatar(String oldUrl) {
        if (oldUrl != null && oldUrl.startsWith(AVATAR_PUBLIC_PATH) && !oldUrl.equals(defaultAvatarUrl)) {
            deleteAvatar(oldUrl);
        }
    }

    private Uploaded toUploaded(StoredImage storedImage) {
        return new Uploaded(storedImage.filename(), storedImage.url());
    }
}
