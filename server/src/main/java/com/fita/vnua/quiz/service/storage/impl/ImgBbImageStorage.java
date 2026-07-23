package com.fita.vnua.quiz.service.storage.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fita.vnua.quiz.service.storage.ImageStorage;
import com.fita.vnua.quiz.service.storage.StoredImage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

@Service
@ConditionalOnProperty(name = "imgbb.enabled", havingValue = "true")
@Slf4j
public class ImgBbImageStorage implements ImageStorage {

    private static final URI UPLOAD_URI = URI.create("https://api.imgbb.com/1/upload");

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public ImgBbImageStorage(
            ObjectMapper objectMapper,
            @Value("${imgbb.api-key}") String apiKey
    ) {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }

    @Override
    public StoredImage save(String directory, String publicPathPrefix, String filename, byte[] bytes) throws Exception {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("ImgBB API key must be configured");
        }

        String requestBody = "key=" + encode(apiKey)
                + "&name=" + encode(stripExtension(filename))
                + "&image=" + encode(Base64.getEncoder().encodeToString(bytes));

        HttpRequest request = HttpRequest.newBuilder(UPLOAD_URI)
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("ImgBB upload failed with status " + response.statusCode());
        }

        JsonNode root = objectMapper.readTree(response.body());
        if (!root.path("success").asBoolean(false)) {
            throw new IllegalStateException("ImgBB upload failed: " + root.path("error").path("message").asText("Unknown error"));
        }

        JsonNode data = root.path("data");
        String url = data.path("url").asText(null);
        String storedFilename = data.path("id").asText(stripExtension(filename));
        if (url == null || url.isBlank()) {
            throw new IllegalStateException("ImgBB response does not contain image URL");
        }

        return new StoredImage(storedFilename, url);
    }

    @Override
    public void delete(String directory, String publicPathPrefix, String url) {
        if (url != null && !url.isBlank()) {
            log.debug("ImgBB delete is skipped because this storage does not persist delete_url for url: {}", url);
        }
    }

    private String stripExtension(String filename) {
        int dotIndex = filename == null ? -1 : filename.lastIndexOf('.');
        return dotIndex > 0 ? filename.substring(0, dotIndex) : filename;
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }
}
