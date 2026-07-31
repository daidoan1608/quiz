package com.fita.vnua.quiz.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ProblemDetailsFactoryTest {

    private final ProblemDetailsFactory factory = new ProblemDetailsFactory();

    @Test
    void createSetsProblemTypeFromErrorCodeAndTraceIdFromHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/admin/subjects");
        request.addHeader("X-Trace-Id", "trace-from-client");

        ProblemDetail problem = factory.create(
                HttpStatus.BAD_REQUEST,
                "INVALID_REQUEST_BODY",
                "Request body không hợp lệ",
                "Dữ liệu gửi lên không đúng định dạng",
                List.of("categoryId phải là số nguyên"),
                request
        );

        assertThat(problem.getType().toString()).isEqualTo("urn:problem:invalid-request-body");
        assertThat(problem.getTitle()).isEqualTo("Request body không hợp lệ");
        assertThat(problem.getDetail()).isEqualTo("Dữ liệu gửi lên không đúng định dạng");
        assertThat(problem.getStatus()).isEqualTo(400);
        assertThat(problem.getInstance().toString()).isEqualTo("/api/v1/admin/subjects");
        assertThat(problem.getProperties()).containsEntry("code", "INVALID_REQUEST_BODY");
        assertThat(problem.getProperties()).containsEntry("traceId", "trace-from-client");
    }

    @Test
    void createReusesGeneratedTraceIdWithinRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/auth/me");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        try {
            ProblemDetail first = createUnauthorized(request);
            ProblemDetail second = createUnauthorized(request);

            assertThat(first.getProperties().get("traceId")).isNotNull();
            assertThat(second.getProperties().get("traceId")).isEqualTo(first.getProperties().get("traceId"));
        } finally {
            RequestContextHolder.resetRequestAttributes();
        }
    }

    private ProblemDetail createUnauthorized(HttpServletRequest request) {
        return factory.create(
                HttpStatus.UNAUTHORIZED,
                "UNAUTHORIZED",
                "Chưa xác thực",
                "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
                List.of("Vui lòng đăng nhập lại"),
                request
        );
    }
}
