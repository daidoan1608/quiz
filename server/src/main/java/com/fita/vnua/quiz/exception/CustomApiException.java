package com.fita.vnua.quiz.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class CustomApiException extends RuntimeException {
    private HttpStatus status;

    public CustomApiException(String message) {
        super(message);
    }
    public CustomApiException(String message, Throwable cause) {
        super(message, cause);
    }

    public CustomApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
