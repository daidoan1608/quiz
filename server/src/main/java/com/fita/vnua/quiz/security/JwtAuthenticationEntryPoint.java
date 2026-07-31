package com.fita.vnua.quiz.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fita.vnua.quiz.exception.ProblemDetailsFactory;
import com.fita.vnua.quiz.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    private final ObjectMapper objectMapper;
    private final ProblemDetailsFactory problemDetailsFactory;
    private final AuditLogService auditLogService;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws  IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        auditLogService.recordSecurityEvent("AUTH_REQUIRED", request.getRequestURI(), "Request chưa xác thực");
        ProblemDetail body = problemDetailsFactory.create(
                HttpStatus.UNAUTHORIZED,
                "UNAUTHORIZED",
                "Chưa xác thực",
                "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
                List.of("Vui lòng đăng nhập lại"),
                request
        );
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
