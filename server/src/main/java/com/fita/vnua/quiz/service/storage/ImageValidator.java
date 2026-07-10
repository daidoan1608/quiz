package com.fita.vnua.quiz.service.storage;

import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.util.Set;

@Component
public class ImageValidator {

    private static final long MAX_IMAGE_SIZE_BYTES = 20L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/gif", "image/webp");

    public void validate(String originalName, String contentType, long size, byte[] bytes) throws Exception {
        validateMetadata(originalName, contentType, size);
        validateContent(bytes);
    }

    public String getSafeExtension(String originalName) {
        String extension = extractExtension(originalName);
        return ALLOWED_EXTENSIONS.contains(extension) ? extension : ".jpg";
    }

    private void validateMetadata(String originalName, String contentType, long size) {
        if (size <= 0 || size > MAX_IMAGE_SIZE_BYTES) {
            throw new IllegalArgumentException("Invalid image size");
        }

        String extension = extractExtension(originalName);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Unsupported image file type");
        }

        if (contentType != null && !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported image content type");
        }
    }

    private String extractExtension(String originalName) {
        if (originalName == null || !originalName.contains(".")) {
            return ".jpg";
        }

        String extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();
        return extension.length() > 10 ? ".jpg" : extension;
    }

    private void validateContent(byte[] bytes) throws Exception {
        if (bytes == null || ImageIO.read(new ByteArrayInputStream(bytes)) == null) {
            throw new IllegalArgumentException("Invalid image content");
        }
    }
}
