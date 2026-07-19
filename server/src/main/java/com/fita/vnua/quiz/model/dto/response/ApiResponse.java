package com.fita.vnua.quiz.model.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private String status;
    private String code;
    private String message;
    private T data;
    private List<String> errors;
    private String path;
    private Instant timestamp;

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .status("success")
                .code("SUCCESS")
                .message(message)
                .data(data)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> created(String message, T data) {
        return success(message, data);
    }

    public static <T> ApiResponse<T> empty(String message, T emptyData) {
        return success(message, emptyData);
    }

    public static <T> ApiResponse<T> notFound(String message, String error) {
        return error("NOT_FOUND", message, error);
    }

    public static <T> ApiResponse<T> error(String message, List<String> errors) {
        return error("ERROR", message, errors, null);
    }

    public static <T> ApiResponse<T> error(String message, String error) {
        return error("ERROR", message, List.of(error), null);
    }

    public static <T> ApiResponse<T> error(String code, String message, String error) {
        return error(code, message, List.of(error), null);
    }

    public static <T> ApiResponse<T> error(String code, String message, List<String> errors) {
        return error(code, message, errors, null);
    }

    public static <T> ApiResponse<T> error(String code, String message, List<String> errors, String path) {
        return ApiResponse.<T>builder()
                .status("error")
                .code(code)
                .message(message)
                .data(null)
                .errors(errors)
                .path(path)
                .timestamp(Instant.now())
                .build();
    }
}
