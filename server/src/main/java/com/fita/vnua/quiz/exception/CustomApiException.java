package com.fita.vnua.quiz.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@Getter
public class CustomApiException extends RuntimeException {
    private HttpStatus status;

    public CustomApiException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;  // Mặc định là Bad Request
    }

    public CustomApiException(String message, Throwable cause) {
        super(message, cause);
        this.status = HttpStatus.BAD_REQUEST;
    }

    public CustomApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}