package com.fita.vnua.quiz.service.impl;

import com.google.api.client.http.FileContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class GDriveAvatarService {
    private final Drive drive;

    // Bạn có thể bind bằng @Value nếu muốn lấy từ application.properties
    private String folderId = "1fs2MtruFxzrwLU5US9lsPruV6tvTLzyu";
    private boolean makePublic = true;

    public Uploaded uploadAvatar(String userId, MultipartFile file) throws Exception {
        // --- Xác định extension ---
        String ext = ".jpg";
        if ("image/png".equals(file.getContentType())) ext = ".png";
        else if ("image/webp".equals(file.getContentType())) ext = ".webp";

        // --- Tạo tên file ---
        String filename = "avatar_" + userId + "_" + System.currentTimeMillis() + ext;

        // --- File tạm để upload ---
        java.io.File tmp = java.nio.file.Files.createTempFile("up-", ext).toFile();
        file.transferTo(tmp.toPath());

        FileContent media = new FileContent(file.getContentType(), tmp);

        // 1. Create file (ban đầu sẽ vào My Drive của SA)
        File meta = new File().setName(filename);
        File created = drive.files()
                .create(meta, media)
                .setFields("id, parents")
                .execute();

        String fileId = created.getId();

        // 2. Move file sang thư mục Avatar của bạn
        if (folderId != null) {
            drive.files().update(fileId, null)
                    .setAddParents(folderId)
                    .setRemoveParents(
                            created.getParents() == null
                                    ? null
                                    : String.join(",", created.getParents())
                    )
                    .execute();
        }

        // 3. Set quyền public nếu cần
        String url;
        if (makePublic) {
            var anyone = new com.google.api.services.drive.model.Permission()
                    .setType("anyone").setRole("reader");
            drive.permissions().create(fileId, anyone).execute();

            url = "https://drive.google.com/uc?export=view&id=" + fileId;
        } else {
            url = "/public/avatar/" + userId; // proxy BE
        }

        tmp.delete();
        System.out.println("✅ Uploaded: " + fileId + " -> " + url);

        return new Uploaded(fileId, url);
    }

    @Data
    @AllArgsConstructor
    public static class Uploaded {
        private String fileId;
        private String url;
    }
}
