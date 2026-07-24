package com.fita.vnua.quiz.exception;

import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomApiException.class)
    public ResponseEntity<ApiResponse<Object>> handleCustomApiException(CustomApiException ex, HttpServletRequest request) {
        return buildErrorResponse(ex.getStatus(), ex.getCode(), ex.getMessage(), List.of(ex.getMessage()), request);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleEntityNotFoundException(EntityNotFoundException ex, HttpServletRequest request) {
        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                "NOT_FOUND",
                "Không tìm thấy dữ liệu phù hợp",
                List.of("Dữ liệu không tồn tại hoặc đã bị xóa"),
                request
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgumentException(IllegalArgumentException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage(), List.of(ex.getMessage()), request);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalStateException(IllegalStateException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage(), List.of(ex.getMessage()), request);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Object>> handleResponseStatusException(ResponseStatusException ex, HttpServletRequest request) {
        String message = ex.getReason() != null ? ex.getReason() : ex.getMessage();
        return buildErrorResponse(ex.getStatusCode(), resolveCode(ex.getStatusCode()), message, List.of(message), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest request) {
        return buildErrorResponse(
                HttpStatus.FORBIDDEN,
                "FORBIDDEN",
                "Bạn không có quyền thực hiện thao tác này",
                List.of("Quyền truy cập bị từ chối"),
                request
        );
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentialsException(BadCredentialsException ex, HttpServletRequest request) {
        return buildErrorResponse(
                HttpStatus.UNAUTHORIZED,
                "INVALID_CREDENTIALS",
                "Tên đăng nhập/email hoặc mật khẩu không đúng",
                List.of("Thông tin đăng nhập không hợp lệ"),
                request
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();

        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                "Dữ liệu gửi lên không hợp lệ",
                errors,
                request
        );
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex,
            HttpServletRequest request
    ) {
        log.warn("Unsupported request method: {} {}", request.getMethod(), request.getRequestURI());
        return buildErrorResponse(
                HttpStatus.METHOD_NOT_ALLOWED,
                "METHOD_NOT_ALLOWED",
                "Phương thức request không được hỗ trợ",
                List.of("Endpoint này không hỗ trợ " + request.getMethod()),
                request
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneralException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled backend exception", ex);
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "Hệ thống đang gặp sự cố, vui lòng thử lại sau",
                List.of("Lỗi hệ thống"),
                request
        );
    }

    private ResponseEntity<ApiResponse<Object>> buildErrorResponse(
            HttpStatusCode status,
            String code,
            String message,
            List<String> errors,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(status)
                .body(ApiResponse.error(code, message, errors, request.getRequestURI()));
    }

    private String resolveCode(HttpStatusCode status) {
        if (status.is4xxClientError()) {
            return "REQUEST_ERROR";
        }
        if (status.is5xxServerError()) {
            return "INTERNAL_SERVER_ERROR";
        }
        return "ERROR";
    }
}
