package com.fita.vnua.quiz.configuration;

import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.security.CustomUserDetailsService;
import com.fita.vnua.quiz.security.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final String WS_USER_ID = "WS_USER_ID";

    private final JwtTokenUtil jwtTokenUtil;
    private final CustomUserDetailsService customUserDetailsService;

    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins)
                .addInterceptors(new CookieJwtHandshakeInterceptor(jwtTokenUtil, customUserDetailsService))
                .setHandshakeHandler(new UserIdHandshakeHandler())
                .withSockJS();
    }

    private static class CookieJwtHandshakeInterceptor implements HandshakeInterceptor {
        private final JwtTokenUtil jwtTokenUtil;
        private final CustomUserDetailsService customUserDetailsService;

        CookieJwtHandshakeInterceptor(JwtTokenUtil jwtTokenUtil, CustomUserDetailsService customUserDetailsService) {
            this.jwtTokenUtil = jwtTokenUtil;
            this.customUserDetailsService = customUserDetailsService;
        }

        @Override
        public boolean beforeHandshake(
                ServerHttpRequest request,
                ServerHttpResponse response,
                WebSocketHandler wsHandler,
                Map<String, Object> attributes
        ) {
            if (request instanceof ServletServerHttpRequest servletRequest) {
                String token = jwtTokenUtil.getJwtFromCookies(servletRequest.getServletRequest());
                if (token == null) {
                    return false;
                }

                String username = jwtTokenUtil.getUsernameFromToken(token);
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                if (!jwtTokenUtil.validateToken(token, userDetails)) {
                    return false;
                }

                if (userDetails instanceof User user) {
                    attributes.put(WS_USER_ID, user.getUserId().toString());
                    return true;
                }
            }
            return false;
        }

        @Override
        public void afterHandshake(
                ServerHttpRequest request,
                ServerHttpResponse response,
                WebSocketHandler wsHandler,
                Exception exception
        ) {
        }
    }

    private static class UserIdHandshakeHandler extends DefaultHandshakeHandler {
        @Override
        protected Principal determineUser(
                ServerHttpRequest request,
                WebSocketHandler wsHandler,
                Map<String, Object> attributes
        ) {
            Object userId = attributes.get(WS_USER_ID);
            return userId == null ? null : () -> userId.toString();
        }
    }
}
