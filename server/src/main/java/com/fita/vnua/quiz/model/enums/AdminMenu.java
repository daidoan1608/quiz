package com.fita.vnua.quiz.model.enums;

import java.util.Arrays;
import java.util.List;

public enum AdminMenu {
    DASHBOARD("MENU_DASHBOARD"),
    NOTIFICATIONS("MENU_NOTIFICATIONS"),
    DOCUMENTS("MENU_DOCUMENTS"),
    USER_EXAMS("MENU_USER_EXAMS"),
    USERS("MENU_USERS"),
    GROUPS("MENU_GROUPS"),
    EXAMS("MENU_EXAMS"),
    CATEGORIES("MENU_CATEGORIES"),
    SUBJECTS("MENU_SUBJECTS"),
    CHAPTERS("MENU_CHAPTERS"),
    QUESTIONS("MENU_QUESTIONS"),
    AUDIT_LOGS("MENU_AUDIT_LOGS"),
    ADMIN_GROUPS("MENU_ADMIN_GROUPS");

    private final String code;

    AdminMenu(String code) {
        this.code = code;
    }

    public String code() {
        return code;
    }

    public static List<String> codes() {
        return Arrays.stream(values())
                .map(AdminMenu::code)
                .toList();
    }

    public static boolean isMenuResource(String resource) {
        return resource != null && resource.startsWith("MENU_");
    }
}
