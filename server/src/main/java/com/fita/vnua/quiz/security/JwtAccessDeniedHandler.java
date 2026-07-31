package com.fita.vnua.quiz.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fita.vnua.quiz.exception.ProblemDetailsFactory;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler {
    private final ObjectMapper objectMapper;
    private final ProblemDetailsFactory problemDetailsFactory;

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException)
            throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        ProblemDetail body = problemDetailsFactory.create(
                HttpStatus.FORBIDDEN,
                "FORBIDDEN",
                "Bạn không có quyền thực hiện thao tác này",
                "Bạn không có quyền thực hiện thao tác này",
                List.of("Quyền truy cập bị từ chối"),
                request
        );
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
