package com.fita.vnua.quiz.security;

import com.fita.vnua.quiz.exception.CustomApiException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import java.security.Key;
import java.util.*;
import java.util.function.Function;

@Component
public class JwtTokenUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-expiration}")
    private Long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;

    // --- CÁC BIẾN CONFIG (Đã khai báo đúng) ---
    @Value("${app.cookie.domain}")
    private String cookieDomain;

    @Value("${app.cookie.secure}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site}")
    private String cookieSameSite;

    private final String ACCESS_TOKEN_COOKIE_NAME = "accessToken";
    private final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateToken(String username) {
        return generateToken(new HashMap<>(), username);
    }

    // Thêm hàm này nếu bạn muốn tạo RefreshToken dạng JWT (để khớp với logic cũ)
    public String generateRefreshTokenString(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = getUsernameFromToken(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (ExpiredJwtException ex) {
            throw new CustomApiException("Token has expired", HttpStatus.UNAUTHORIZED);
        } catch (JwtException ex) {
            throw new CustomApiException("Invalid JWT token", HttpStatus.UNAUTHORIZED);
        } catch (IllegalArgumentException ex) {
            throw new CustomApiException("Token is null, empty or only whitespace", HttpStatus.BAD_REQUEST);
        }
    }

    public String getUsernameFromToken(String token) {
        try {
            return getClaimFromToken(token, Claims::getSubject);
        } catch (ExpiredJwtException ex) {
            throw new CustomApiException("Token has expired", HttpStatus.UNAUTHORIZED);
        } catch (JwtException ex) {
            throw new CustomApiException("Invalid JWT token", HttpStatus.UNAUTHORIZED);
        }
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    // --- PHẦN SỬA ĐỔI: DÙNG BIẾN CONFIG THAY VÌ HARDCODE ---

    /**
     * Tạo HttpOnly Cookie chứa Access Token
     */
    public ResponseCookie generateAccessJwtCookie(String token) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(ACCESS_TOKEN_COOKIE_NAME, token)
                .path("/")
                .maxAge(accessTokenExpiration / 1000)
                .httpOnly(true)
                .secure(cookieSecure)       // <--- SỬA: Dùng biến cookieSecure
                .sameSite(cookieSameSite);  // <--- SỬA: Dùng biến cookieSameSite

        // Logic Domain: Chỉ set nếu config có giá trị (Prod)
        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            builder.domain(cookieDomain);
        }

        return builder.build();
    }

    /**
     * Tạo HttpOnly Cookie chứa Refresh Token
     */
    public ResponseCookie generateRefreshJwtCookie(String refreshToken) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, refreshToken)
                .path("/")
                .maxAge(refreshTokenExpiration / 1000)
                .httpOnly(true)
                .secure(cookieSecure)       // <--- SỬA
                .sameSite(cookieSameSite);  // <--- SỬA

        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            builder.domain(cookieDomain);
        }

        return builder.build();
    }

    /**
     * Lấy token raw từ trong Cookie của Request
     */
    public String getJwtFromCookies(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, ACCESS_TOKEN_COOKIE_NAME);
        if (cookie != null) {
            return cookie.getValue();
        }
        return null;
    }

    public String getRefreshTokenFromCookies(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, REFRESH_TOKEN_COOKIE_NAME);
        if (cookie != null) {
            return cookie.getValue();
        }
        return null;
    }

    /**
     * Xóa Cookie (Logout)
     * QUAN TRỌNG: Phải set đúng domain lúc tạo thì mới xóa được
     */
    public ResponseCookie getCleanJwtCookie() {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(ACCESS_TOKEN_COOKIE_NAME, "")
                .path("/")
                .maxAge(0); // Set maxAge = 0 để xóa ngay lập tức

        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            builder.domain(cookieDomain);
        }

        return builder.build();
    }

    public ResponseCookie getCleanRefreshJwtCookie() {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, "")
                .path("/")
                .maxAge(0);

        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            builder.domain(cookieDomain);
        }

        return builder.build();
    }
}