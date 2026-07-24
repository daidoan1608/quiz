package com.fita.vnua.quiz.security;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    @Cacheable(value = "userDetails", key = "#usernameOrEmail")
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng with username or email: " + usernameOrEmail));
        if (Boolean.TRUE.equals(user.getDeleted())) {
            throw new DisabledException("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.");
        }
        return user;
    }

    public void ensurePasswordConfigured(String usernameOrEmail) {
        User user = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng with username or email: " + usernameOrEmail));
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new CustomApiException(
                    "ACCOUNT_NEEDS_PASSWORD",
                    "Tài khoản này đang đăng nhập bằng Google. Vui lòng thiết lập mật khẩu trước.",
                    HttpStatus.BAD_REQUEST
            );
        }
    }
}
