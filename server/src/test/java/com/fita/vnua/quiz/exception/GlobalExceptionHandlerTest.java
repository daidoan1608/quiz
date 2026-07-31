package com.fita.vnua.quiz.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler(new ProblemDetailsFactory());
    private final MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/admin/subjects");

    @Test
    void handleMessageNotReadableReturnsBadRequestForInvalidJsonValueType() {
        InvalidFormatException invalidFormat = InvalidFormatException.from(
                null,
                "Cannot deserialize value",
                "abc",
                Long.class
        );
        invalidFormat.prependPath(new Object(), "categoryId");

        ResponseEntity<ProblemDetail> response = handler.handleMessageNotReadable(
                new HttpMessageNotReadableException("Invalid request body", invalidFormat),
                request
        );

        ProblemDetail body = response.getBody();
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(body).isNotNull();
        assertThat(body.getType().toString()).isEqualTo("urn:problem:invalid-request-body");
        assertThat(body.getTitle()).isEqualTo("Request body không hợp lệ");
        assertThat(body.getDetail()).isEqualTo("Dữ liệu gửi lên không đúng định dạng");
        assertThat(body.getProperties()).containsEntry("code", "INVALID_REQUEST_BODY");
        assertThat(errors(body)).containsEntry("categoryId", List.of("phải là số nguyên"));
    }

    @Test
    void handleMethodArgumentTypeMismatchReturnsBadRequest() throws NoSuchMethodException {
        Method method = getClass().getDeclaredMethod("sampleLong", Long.class);
        MethodArgumentTypeMismatchException exception = new MethodArgumentTypeMismatchException(
                "abc",
                Long.class,
                "categoryId",
                new MethodParameter(method, 0),
                new IllegalArgumentException("bad number")
        );

        ResponseEntity<ProblemDetail> response = handler.handleMethodArgumentTypeMismatch(exception, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getType().toString()).isEqualTo("urn:problem:invalid-request-parameter");
        assertThat(errors(response.getBody())).containsEntry("categoryId", List.of("phải là số nguyên"));
    }

    @Test
    void handleMissingServletRequestParameterReturnsBadRequest() {
        ResponseEntity<ProblemDetail> response = handler.handleMissingServletRequestParameter(
                new MissingServletRequestParameterException("token", "String"),
                request
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getType().toString()).isEqualTo("urn:problem:missing-request-parameter");
        assertThat(errors(response.getBody())).containsEntry("token", List.of("là bắt buộc"));
    }

    @Test
    void handleGeneralExceptionReturnsInternalServerProblemDetails() {
        ResponseEntity<ProblemDetail> response = handler.handleGeneralException(new RuntimeException("boom"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().getType().toString()).isEqualTo("urn:problem:internal-server-error");
        assertThat(response.getBody().getTitle()).isEqualTo("Lỗi hệ thống");
        assertThat(response.getBody().getDetail()).isEqualTo("Hệ thống đang gặp sự cố, vui lòng thử lại sau");
    }

    @Test
    void handleConstraintViolationReturnsValidationProblemDetails() {
        ResponseEntity<ProblemDetail> response = handler.handleConstraintViolationException(
                new ConstraintViolationException("invalid", java.util.Set.of()),
                request
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getType().toString()).isEqualTo("urn:problem:validation-error");
        assertThat(response.getBody().getTitle()).isEqualTo("Dữ liệu không hợp lệ");
    }

    void sampleLong(Long value) {
    }

    @SuppressWarnings("unchecked")
    private Map<String, List<String>> errors(ProblemDetail body) {
        return (Map<String, List<String>>) body.getProperties().get("errors");
    }
}
