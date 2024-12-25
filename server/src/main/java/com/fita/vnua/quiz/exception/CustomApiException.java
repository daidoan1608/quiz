package com.fita.vnua.quiz.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@Getter
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

}
