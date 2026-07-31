package com.fita.vnua.quiz.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
public class ProblemDetailsFactory {

    public ProblemDetail create(
            HttpStatusCode status,
            String code,
            String title,
            String detail,
            List<String> errors,
            HttpServletRequest request
    ) {
        return create(status, code, title, detail, (Object) errors, request);
    }

    public ProblemDetail create(
            HttpStatusCode status,
            String code,
            String title,
            String detail,
            Object errors,
            HttpServletRequest request
    ) {
        ErrorCode errorCode = ErrorCode.fromCode(code, status);
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, detail);
        problemDetail.setType(URI.create(errorCode.type()));
        problemDetail.setTitle(title == null || title.isBlank() ? errorCode.title() : title);
        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setProperty("code", errorCode.code());
        problemDetail.setProperty("errors", errors);
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("traceId", resolveTraceId(request));
        return problemDetail;
    }

    private String resolveTraceId(HttpServletRequest request) {
        Object requestTraceId = request.getAttribute("traceId");
        if (requestTraceId instanceof String existing && !existing.isBlank()) {
            return existing;
        }

        String traceId = request.getHeader("X-Trace-Id");
        if (traceId != null && !traceId.isBlank()) {
            return traceId;
        }

        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            Object existingTraceId = attributes.getAttribute("traceId", RequestAttributes.SCOPE_REQUEST);
            if (existingTraceId instanceof String existing && !existing.isBlank()) {
                return existing;
            }

            String generatedTraceId = UUID.randomUUID().toString();
            attributes.setAttribute("traceId", generatedTraceId, RequestAttributes.SCOPE_REQUEST);
            return generatedTraceId;
        }
        return UUID.randomUUID().toString();
    }
}
