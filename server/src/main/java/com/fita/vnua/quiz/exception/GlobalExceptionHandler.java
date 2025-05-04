package com.fita.vnua.quiz.exception;

import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.dto.response.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomApiException.class)
    public ResponseEntity<ApiResponse<Object>> handleCustomApiException(CustomApiException ex) {
        // Tạo lỗi trả về với ApiResponse
        ApiResponse<Object> response = ApiResponse.error(
                ex.getMessage(),
                List.of("Custom API Exception: " + ex.getMessage())  // Danh sách lỗi chi tiết
        );

        // Cấu hình mã trạng thái HTTP
        return new ResponseEntity<>(response, ex.getStatus());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneralException(Exception ex) {
        // Tạo lỗi trả về cho các lỗi chung (internal server error)
        ApiResponse<Object> response = ApiResponse.error(
                "An unexpected error occurred",
                List.of(ex.getMessage())
        );

        // Cấu hình mã trạng thái HTTP 500
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
