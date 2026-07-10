package com.fita.vnua.quiz.configuration.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "app.security")
public class SecurityProperties {
    private boolean csrfEnabled = true;
    private List<String> csrfIgnoredAntMatchers = new ArrayList<>(List.of(
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/google",
            "/api/v1/auth/refresh",
            "/api/v1/otp/**"
    ));

    public boolean isCsrfEnabled() {
        return csrfEnabled;
    }

    public void setCsrfEnabled(boolean csrfEnabled) {
        this.csrfEnabled = csrfEnabled;
    }

    public List<String> getCsrfIgnoredAntMatchers() {
        return csrfIgnoredAntMatchers;
    }

    public void setCsrfIgnoredAntMatchers(List<String> csrfIgnoredAntMatchers) {
        this.csrfIgnoredAntMatchers = csrfIgnoredAntMatchers;
    }
}
