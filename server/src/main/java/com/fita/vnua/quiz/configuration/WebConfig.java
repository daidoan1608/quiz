package com.fita.vnua.quiz.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List; // Nhớ import List

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // 1. Đọc danh sách domain từ file application-{profile}.properties
    // Spring Boot sẽ tự động tách chuỗi "a,b,c" thành List<String>
    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    // 2. Giữ nguyên biến này (Đọc đường dẫn upload ảnh)
    @Value("${avatar.upload-dir}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Áp dụng cho tất cả endpoint
                // 3. SỬA: Chuyển List thành Array để Spring nhận diện
                .allowedOrigins(allowedOrigins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                // 4. Khuyên dùng "*" cho Header để tránh lỗi khi FE gửi token custom
                .allowedHeaders("*")
                .allowCredentials(true); // Bắt buộc true để nhận Cookie
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Phần này bạn viết chuẩn rồi, giữ nguyên logic
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String location = "file:" + uploadPath + "/";

        registry.addResourceHandler("/avatars/**")
                .addResourceLocations(location);
    }
}