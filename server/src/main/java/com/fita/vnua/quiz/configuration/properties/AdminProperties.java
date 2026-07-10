package com.fita.vnua.quiz.configuration.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.admin")
public class AdminProperties {
    private boolean initializerEnabled;
    private String username;
    private String password;
    private String email;
    private String fullName = "Quản trị viên Hệ thống";

    public boolean isInitializerEnabled() {
        return initializerEnabled;
    }

    public void setInitializerEnabled(boolean initializerEnabled) {
        this.initializerEnabled = initializerEnabled;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
}
