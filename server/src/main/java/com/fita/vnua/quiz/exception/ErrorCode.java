package com.fita.vnua.quiz.exception;

import org.springframework.http.HttpStatusCode;

public enum ErrorCode {
    BAD_REQUEST("Request không hợp lệ"),
    CONFLICT("Dữ liệu bị xung đột"),
    FORBIDDEN("Không có quyền truy cập"),
    INTERNAL_SERVER_ERROR("Lỗi hệ thống"),
    INVALID_CREDENTIALS("Xác thực thất bại"),
    INVALID_OTP("OTP không hợp lệ"),
    INVALID_REQUEST_BODY("Request body không hợp lệ"),
    INVALID_REQUEST_PARAMETER("Tham số request không hợp lệ"),
    INVALID_RESET_TOKEN("Token đặt lại mật khẩu không hợp lệ"),
    INVALID_TOKEN("Token không hợp lệ"),
    METHOD_NOT_ALLOWED("Phương thức không được hỗ trợ"),
    MISSING_REQUEST_PARAMETER("Thiếu tham số request"),
    MISSING_REQUEST_PART("Thiếu dữ liệu multipart"),
    NOT_FOUND("Không tìm thấy tài nguyên"),
    OTP_EMAIL_NOT_FOUND("Email không hợp lệ"),
    OTP_EXPIRED("OTP đã hết hạn"),
    OTP_LOCKED("OTP đã bị khóa"),
    OTP_NOT_FOUND("Không tìm thấy OTP"),
    REQUEST_ERROR("Request không hợp lệ"),
    RATE_LIMIT_EXCEEDED("Quá nhiều request"),
    RESET_TOKEN_EXPIRED("Token đặt lại mật khẩu đã hết hạn"),
    PAYLOAD_TOO_LARGE("Payload quá lớn"),
    TOKEN_EXPIRED("Token đã hết hạn"),
    UNAUTHORIZED("Chưa xác thực"),
    UNSUPPORTED_MEDIA_TYPE("Content-Type không được hỗ trợ"),
    VALIDATION_ERROR("Dữ liệu không hợp lệ");

    private final String title;

    ErrorCode(String title) {
        this.title = title;
    }

    public String code() {
        return name();
    }

    public String title() {
        return title;
    }

    public String type() {
        return "urn:problem:" + name().toLowerCase().replace("_", "-");
    }

    public static ErrorCode fromCode(String code, HttpStatusCode status) {
        if (code != null) {
            for (ErrorCode value : values()) {
                if (value.name().equals(code)) {
                    return value;
                }
            }
        }
        return status != null && status.is5xxServerError() ? INTERNAL_SERVER_ERROR : REQUEST_ERROR;
    }
}
