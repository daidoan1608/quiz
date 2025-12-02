package com.fita.vnua.quiz.service.impl;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class AvatarStorageService {

    @Value("${avatar.upload-dir}")
    private String uploadDir;

    @Value("${avatar.default-url}")
    private String defaultUrl;

    public Uploaded saveAvatar(UUID userId, MultipartFile file, String oldUrl) throws Exception {
        // Xóa file cũ nếu có (không xóa default)
        if (oldUrl != null && oldUrl.startsWith("/avatars/") && !oldUrl.equals(defaultUrl)) {
            deleteAvatar(oldUrl);
        }

        // Tạo folder nếu chưa tồn tại
        Path folder = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(folder);

        // Tên file duy nhất
        String ext = getExtension(file.getOriginalFilename());
        String filename = "avatar_" + userId + "_" + System.currentTimeMillis() + ext;

        // Lưu file
        Path target = folder.resolve(filename);
        file.transferTo(target.toFile());

        // Trả về đường dẫn
        String url = "/avatars/" + filename;
        return new Uploaded(filename, url);
    }

    public void deleteAvatar(String url) {
        try {
            String filename = url.replace("/avatars/", "");
            Path path = Paths.get(uploadDir).resolve(filename).toAbsolutePath();
            Files.deleteIfExists(path);
        } catch (Exception e) {
            System.err.println("⚠️ Không thể xóa avatar cũ: " + e.getMessage());
        }
    }

    public String getDefaultUrl() {
        return defaultUrl;
    }

    private String getExtension(String name) {
        if (name == null || !name.contains(".")) return ".jpg";
        return name.substring(name.lastIndexOf("."));
    }

    @Data
    @AllArgsConstructor
    public static class Uploaded {
        private String filename;
        private String url;
    }
}
