package com.fita.vnua.quiz.service.storage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@ConditionalOnProperty(name = "cloudinary.enabled", havingValue = "false", matchIfMissing = true)
public class LocalImageStorage implements ImageStorage {

    @Override
    public StoredImage save(String directory, String publicPathPrefix, String filename, byte[] bytes) throws Exception {
        Path folder = Paths.get(directory).toAbsolutePath().normalize();
        Files.createDirectories(folder);

        Path target = folder.resolve(filename).normalize();
        if (!target.startsWith(folder)) {
            throw new IllegalArgumentException("Đường dẫn upload không hợp lệ");
        }

        Files.write(target, bytes);
        return new StoredImage(filename, publicPathPrefix + filename);
    }

    @Override
    public void delete(String directory, String publicPathPrefix, String url) throws Exception {
        if (url == null || !url.startsWith(publicPathPrefix)) {
            return;
        }

        String filename = Paths.get(url.replace(publicPathPrefix, "")).getFileName().toString();
        Path folder = Paths.get(directory).toAbsolutePath().normalize();
        Path path = folder.resolve(filename).normalize();

        if (path.startsWith(folder)) {
            Files.deleteIfExists(path);
        }
    }
}
