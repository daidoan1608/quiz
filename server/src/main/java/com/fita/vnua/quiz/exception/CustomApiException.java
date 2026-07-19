package com.fita.vnua.quiz.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@Getter
public class CustomApiException extends RuntimeException {
    private HttpStatus status;
    private String code;

    public CustomApiException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;  // Mặc định là Bad Request
        this.code = "BAD_REQUEST";
    }

    public CustomApiException(String message, Throwable cause) {
        super(message, cause);
        this.status = HttpStatus.BAD_REQUEST;
        this.code = "BAD_REQUEST";
    }

    public CustomApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.code = resolveCode(status);
    }

    public CustomApiException(String code, String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public CustomApiException(String code, String message, HttpStatus status, Throwable cause) {
        super(message, cause);
        this.status = status;
        this.code = code;
    }

    private String resolveCode(HttpStatus status) {
        return switch (status) {
            case NOT_FOUND -> "NOT_FOUND";
            case UNAUTHORIZED -> "UNAUTHORIZED";
            case FORBIDDEN -> "FORBIDDEN";
            case CONFLICT -> "CONFLICT";
            default -> status.is4xxClientError() ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR";
        };
    }
}
