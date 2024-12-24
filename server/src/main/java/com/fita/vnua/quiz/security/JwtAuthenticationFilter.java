// JWT Authentication Filter
package com.fita.vnua.quiz.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenUtil jwtTokenUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil, CustomUserDetailsService userDetailsService) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.userDetailsService = userDetailsService;
    }
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        // Lấy token từ header Authorization
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        // Kiểm tra và trích xuất token
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwtToken = authorizationHeader.substring(7);
            try {
                username = jwtTokenUtil.getUsernameFromToken(jwtToken);
            } catch (Exception e) {
                // Xử lý lỗi khi token không hợp lệ
                logger.error("Không thể xác thực token", e);
            }
        }

        // Xác thực token và thiết lập context security
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
//    @Override
//    protected void doFilterInternal(
//            HttpServletRequest request,
//            HttpServletResponse response,
//            FilterChain filterChain) throws ServletException, IOException {
//        if (isPublicEndpoint(request)) {
//            filterChain.doFilter(request, response);
//            return;
//        }
//
////        try {
//            // Lấy token từ header Authorization
//            final String authorizationHeader = request.getHeader("Authorization");
//
//            String username = null;
//            String jwtToken = null;
//
//            // Nếu không có header Authorization, trả về lỗi 403 Forbidden mà không có response body
//            if (authorizationHeader == null) {
//                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
//                return;
//            }
//
//            // Kiểm tra định dạng token
//            if (!authorizationHeader.startsWith("Bearer ")) {
//                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
//                return;
//            }
//
//            // Trích xuất token
//            jwtToken = authorizationHeader.substring(7);
//
//            try {
//                // Lấy username từ token
//                username = jwtTokenUtil.getUsernameFromToken(jwtToken);
//            } catch (ExpiredJwtException e) {
//                // Trả về 403 Forbidden khi token hết hạn
//                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
//                return;
//            } catch (JwtException e) {
//                // Trả về 403 Forbidden cho các lỗi JWT khác
//                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
//                return;
//            }
//
//            // Xác thực token và thiết lập context security
//            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
//                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
//
//                try {
//                    if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {
//                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
//                                userDetails, null, userDetails.getAuthorities()
//                        );
//
//                        SecurityContextHolder.getContext().setAuthentication(authToken);
//                    }
//                } catch (Exception e) {
//                    // Trả về 403 Forbidden nếu xác thực thất bại
//                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
//                    return;
//                }
//            }
//
//            // Chuyển tiếp request nếu xác thực thành công
//            filterChain.doFilter(request, response);
//
//        } catch (Exception e) {
//            // Xử lý các ngoại lệ không mong muốn bằng cách trả về 403
//            logger.error("Unexpected error in JWT authentication", e);
//            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
//        }
//    }

//    private boolean isPublicEndpoint(HttpServletRequest request) {
//        String path = request.getRequestURI();
//        return path.startsWith("/auth/") ||
//                path.startsWith("/public/") ||
//                // Add other public endpoint patterns
//                path.equals("/login") ||
//                path.equals("/register");
//    }
}
