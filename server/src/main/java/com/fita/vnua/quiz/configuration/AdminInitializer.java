package com.fita.vnua.quiz.configuration;

import com.fita.vnua.quiz.configuration.properties.AdminProperties;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {
    private static final int MIN_ADMIN_PASSWORD_LENGTH = 8;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminProperties adminProperties;

    @Override
    public void run(String... args) {
        if (!adminProperties.isInitializerEnabled()) {
            return;
        }

        validateAdminConfiguration();

        if (userRepository.findByUsername(adminProperties.getUsername()).isPresent()) {
            log.info("Admin initializer skipped: admin user already exists.");
            return;
        }

        User admin = new User();
        admin.setUsername(adminProperties.getUsername());
        admin.setPassword(passwordEncoder.encode(adminProperties.getPassword()));
        admin.setRole(User.Role.ADMIN);
        admin.setEmail(adminProperties.getEmail());
        admin.setFullName(adminProperties.getFullName());

        userRepository.save(admin);
        log.info("Admin account created successfully from secure configuration.");
    }

    private void validateAdminConfiguration() {
        if (!StringUtils.hasText(adminProperties.getUsername())) {
            throw new IllegalStateException("ADMIN_USERNAME is required when admin initializer is enabled");
        }
        if (!StringUtils.hasText(adminProperties.getEmail())) {
            throw new IllegalStateException("ADMIN_EMAIL is required when admin initializer is enabled");
        }
        if (!StringUtils.hasText(adminProperties.getPassword())
                || adminProperties.getPassword().length() < MIN_ADMIN_PASSWORD_LENGTH
                || "admin".equalsIgnoreCase(adminProperties.getPassword())
                || "password".equalsIgnoreCase(adminProperties.getPassword())) {
            throw new IllegalStateException("ADMIN_PASSWORD must be strong and at least 8 characters when admin initializer is enabled");
        }
    }
}
