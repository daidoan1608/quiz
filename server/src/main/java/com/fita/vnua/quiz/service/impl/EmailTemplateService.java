package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.util.HtmlUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailTemplateService {

    private static final String EMAIL_TEMPLATE_PATH = "classpath:templates/email/";

    private final ResourceLoader resourceLoader;

    public String render(String templateName, Map<String, ?> variables) {
        String html = loadTemplate(templateName);
        for (Map.Entry<String, ?> entry : variables.entrySet()) {
            String value = entry.getValue() == null ? "" : entry.getValue().toString();
            html = html.replace("{{" + entry.getKey() + "}}", HtmlUtils.htmlEscape(value, StandardCharsets.UTF_8.name()));
        }
        return html;
    }

    private String loadTemplate(String templateName) {
        Resource resource = resourceLoader.getResource(EMAIL_TEMPLATE_PATH + templateName);
        try {
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new CustomApiException("Không thể đọc template email: " + templateName, e);
        }
    }
}
