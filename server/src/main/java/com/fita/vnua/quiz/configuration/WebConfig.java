package com.fita.vnua.quiz.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Áp dụng cho tất cả các endpoint
                .allowedOrigins("http://localhost:3000","http://localhost:3001") // Nguồn gốc được phép
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS") // Phương thức HTTP được phép
                .allowedHeaders("Authorization", "Content-Type") // Cho phép tất cả header
                .allowCredentials(true); // Cho phép gửi cookie
    }
    @Value("${avatar.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String location = "file:" + uploadPath + "/";

        registry.addResourceHandler("/avatars/**")
                .addResourceLocations(location);
    }
}
