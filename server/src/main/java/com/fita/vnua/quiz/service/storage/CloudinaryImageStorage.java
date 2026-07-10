package com.fita.vnua.quiz.service.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@ConditionalOnProperty(name = "cloudinary.enabled", havingValue = "true")
@Slf4j
public class CloudinaryImageStorage implements ImageStorage {

    private final Cloudinary cloudinary;
    private final String folder;

    public CloudinaryImageStorage(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret,
            @Value("${cloudinary.folder:quiz}") String folder
    ) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
        this.folder = folder;
    }

    @Override
    public StoredImage save(String directory, String publicPathPrefix, String filename, byte[] bytes) throws Exception {
        String typeFolder = publicPathPrefix.replace("/", "");
        String publicId = folder + "/" + typeFolder + "/" + stripExtension(filename);

        Map<?, ?> result = cloudinary.uploader().upload(bytes, ObjectUtils.asMap(
                "public_id", publicId,
                "resource_type", "image",
                "overwrite", true
        ));

        String secureUrl = String.valueOf(result.get("secure_url"));
        String uploadedPublicId = String.valueOf(result.get("public_id"));

        return new StoredImage(uploadedPublicId, secureUrl);
    }

    @Override
    public void delete(String directory, String publicPathPrefix, String url) throws Exception {
        if (url == null || url.isBlank()) {
            return;
        }

        String publicId = extractPublicId(url);
        if (publicId == null || publicId.isBlank()) {
            log.warn("Unable to extract Cloudinary public_id from url: {}", url);
            return;
        }

        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    private String stripExtension(String filename) {
        int dotIndex = filename == null ? -1 : filename.lastIndexOf('.');
        return dotIndex > 0 ? filename.substring(0, dotIndex) : filename;
    }

    private String extractPublicId(String url) {
        int uploadIndex = url.indexOf("/upload/");
        if (uploadIndex < 0) {
            return null;
        }

        String path = url.substring(uploadIndex + "/upload/".length());
        path = path.replaceFirst("^v\\d+/", "");

        int dotIndex = path.lastIndexOf('.');
        return dotIndex > 0 ? path.substring(0, dotIndex) : path;
    }
}
