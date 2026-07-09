package com.fita.vnua.quiz.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws  IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        ApiResponse<Object> body = ApiResponse.error(
                "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
                List.of(authException.getMessage())
        );
        response.getWriter().write(new ObjectMapper().writeValueAsString(body));
    }
}
