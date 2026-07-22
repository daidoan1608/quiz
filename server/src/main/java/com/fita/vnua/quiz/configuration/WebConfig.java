package com.fita.vnua.quiz.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${avatar.upload-dir}")
    private String uploadDir;

    @Value("${question.upload-dir:uploads/questions}")
    private String questionUploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String location = "file:" + uploadPath + "/";

        registry.addResourceHandler("/avatars/**")
                .addResourceLocations(location);

        Path questionPath = Paths.get(questionUploadDir).toAbsolutePath().normalize();
        String questionLocation = "file:" + questionPath + "/";

        registry.addResourceHandler("/questions/**")
                .addResourceLocations(questionLocation);
    }
}
