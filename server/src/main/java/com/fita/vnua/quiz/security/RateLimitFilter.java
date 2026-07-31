package com.fita.vnua.quiz.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fita.vnua.quiz.exception.ProblemDetailsFactory;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {
    private final InMemoryRateLimiter rateLimiter;
    private final ProblemDetailsFactory problemDetailsFactory;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        RateLimitPolicy policy = resolvePolicy(request);
        if (policy != null) {
            String key = policy.name + ":" + clientIp(request);
            if (!rateLimiter.allow(key, policy.maxAttempts, policy.window)) {
                writeRateLimitResponse(request, response, policy);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private RateLimitPolicy resolvePolicy(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return null;
        }
        return switch (request.getRequestURI()) {
            case "/api/v1/auth/login" -> new RateLimitPolicy("auth-login", 5, Duration.ofMinutes(1));
            case "/api/v1/otp/send" -> new RateLimitPolicy("otp-send", 3, Duration.ofMinutes(10));
            case "/api/v1/otp/verify" -> new RateLimitPolicy("otp-verify", 5, Duration.ofMinutes(5));
            case "/api/v1/otp/reset" -> new RateLimitPolicy("otp-reset", 5, Duration.ofMinutes(5));
            default -> null;
        };
    }

    private void writeRateLimitResponse(
            HttpServletRequest request,
            HttpServletResponse response,
            RateLimitPolicy policy
    ) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Retry-After", String.valueOf(policy.window.toSeconds()));
        ProblemDetail body = problemDetailsFactory.create(
                HttpStatus.TOO_MANY_REQUESTS,
                "RATE_LIMIT_EXCEEDED",
                "Quá nhiều request",
                "Bạn thao tác quá nhanh, vui lòng thử lại sau",
                List.of("Vượt quá " + policy.maxAttempts + " request trong " + policy.window.toSeconds() + " giây"),
                request
        );
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record RateLimitPolicy(String name, int maxAttempts, Duration window) {
    }
}
