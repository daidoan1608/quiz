package com.fita.vnua.quiz.security;

import com.fita.vnua.quiz.exception.CustomApiException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            String jwtToken = null;
            // 1. Lấy JWT từ Cookie (Thay vì Header Authorization)
            // Hàm này đã được thêm vào JwtTokenUtil ở bước trước
            jwtToken = jwtTokenUtil.getJwtFromCookies(request);

            if (jwtToken == null) {
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    jwtToken = authHeader.substring(7); // Cắt bỏ chữ "Bearer "
                }
            }

            // 2. Nếu tìm thấy token trong cookie và chưa có authentication trong context
            if (jwtToken != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Lấy username từ token (Hàm này có thể throw CustomApiException nếu token lỗi)
                String username = jwtTokenUtil.getUsernameFromToken(jwtToken);

                if (username != null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    // Validate token
                    if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                        // Set thông tin request (IP, Session ID...) vào authentication
                        // authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }
        } catch (CustomApiException ex) {
            // Trường hợp token hết hạn hoặc không hợp lệ, bạn có 2 lựa chọn:

            // Lựa chọn A (Hiện tại của bạn): Trả về lỗi ngay lập tức
            // response.setStatus(ex.getStatus().value());
            // response.setContentType("application/json");
            // response.getWriter().write("{\"message\": \"" + ex.getMessage() + "\"}");
            // return; // Dừng filter chain

            // Lựa chọn B (Khuyên dùng): Bỏ qua lỗi, coi như người dùng chưa đăng nhập (Anonymous)
            // SecurityContextHolder.clearContext();
            // Lý do: Đôi khi cookie hết hạn nhưng user đang truy cập trang public, không nên chặn họ.
            // Nếu họ truy cập trang private, SecurityConfig sẽ chặn sau.

            // Ở đây tôi giữ theo logic cũ của bạn (Lựa chọn A) nhưng log ra console để debug
            System.out.println("JWT Filter Error: " + ex.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"message\": \"" + ex.getMessage() + "\"}");
            return;
        } catch (Exception e) {
            // Log các lỗi khác nếu có
            System.err.println("Cannot set user authentication: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}