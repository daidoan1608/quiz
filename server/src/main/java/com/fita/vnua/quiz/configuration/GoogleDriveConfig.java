package com.fita.vnua.quiz.configuration;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.util.Value;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.util.Collections;

@Configuration
public class GoogleDriveConfig {

//    @Value("${gdrive.saKeyPath}")
    private Resource saKeyResource = new ClassPathResource("keys/sa.json");

    @Bean
    public Drive drive() throws Exception {

        System.out.println(">>> saKeyResource = " + saKeyResource);
        if (saKeyResource == null) {
            throw new IllegalStateException("❌ Không tìm thấy file sa.json, check gdrive.saKeyPath");
        }
        var http = GoogleNetHttpTransport.newTrustedTransport();
        var jsonFactory = JacksonFactory.getDefaultInstance();

        try (var in = saKeyResource.getInputStream()) {
            GoogleCredential cred = GoogleCredential
                    .fromStream(in, http, jsonFactory)
                    .createScoped(Collections.singleton(DriveScopes.DRIVE));

            return new Drive.Builder(http, jsonFactory, cred)
                    .setApplicationName("QuizApp")
                    .build();
        }
    }
}
