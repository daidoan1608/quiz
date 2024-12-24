package com.fita.vnua.quiz.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Áp dụng cho tất cả các endpoint
                .allowedOrigins("http://localhost:3000") // Nguồn gốc được phép
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS") // Phương thức HTTP được phép
                .allowedHeaders("Authorization", "Content-Type") // Cho phép tất cả header
                .allowCredentials(true); // Cho phép gửi cookie
    }
}
