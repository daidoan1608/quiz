package com.fita.vnua.quiz.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private String status;  // "success" hoặc "error"
    private String message;  // Thông điệp mô tả kết quả (thành công hoặc lỗi)
    private T data;  // Dữ liệu trả về
    private List<String> errors;  // Danh sách lỗi (nếu có)

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .status("success")
                .message(message)
                .data(data)
                .errors(null)
                .build();
    }

    public static <T> ApiResponse<T> created(String message, T data) {
        return success(message, data);
    }

    public static <T> ApiResponse<T> empty(String message, T emptyData) {
        return success(message, emptyData);
    }

    public static <T> ApiResponse<T> notFound(String message, String error) {
        return error(message, error);
    }

    public static <T> ApiResponse<T> error(String message, List<String> errors) {
        return ApiResponse.<T>builder()
                .status("error")
                .message(message)
                .data(null)
                .errors(errors)
                .build();
    }

    public static <T> ApiResponse<T> error(String message, String error) {
        return ApiResponse.<T>builder()
                .status("error")
                .message(message)
                .data(null)
                .errors(List.of(error))
                .build();
    }
}
