package com.fita.vnua.quiz.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.exception.ProblemDetailsFactory;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenUtil jwtTokenUtil;
    private final CustomUserDetailsService userDetailsService;
    private final ObjectMapper objectMapper;
    private final ProblemDetailsFactory problemDetailsFactory;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            String jwtToken = jwtTokenUtil.getJwtFromCookies(request);

            if (jwtToken == null) {
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    jwtToken = authHeader.substring(7);
                }
            }

            if (jwtToken != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                String username = jwtTokenUtil.getUsernameFromToken(jwtToken);

                if (username != null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }
        } catch (CustomApiException ex) {
            log.debug("JWT authentication failed on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getCode());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            ProblemDetail body = problemDetailsFactory.create(
                    HttpStatus.UNAUTHORIZED,
                    ex.getCode() == null ? "UNAUTHORIZED" : ex.getCode(),
                    "Phiên đăng nhập không hợp lệ",
                    "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
                    List.of("Vui lòng đăng nhập lại"),
                    request
            );
            response.getWriter().write(objectMapper.writeValueAsString(body));
            return;
        } catch (Exception e) {
            log.warn("Cannot set user authentication on {} {}", request.getMethod(), request.getRequestURI(), e);
        }

        filterChain.doFilter(request, response);
    }

}
