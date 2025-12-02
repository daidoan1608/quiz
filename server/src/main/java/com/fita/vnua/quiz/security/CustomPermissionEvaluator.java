package com.fita.vnua.quiz.security;// package com.fita.vnua.quiz.security;

import com.fita.vnua.quiz.model.entity.User; // Entity User của bạn
import com.fita.vnua.quiz.repository.*; // Các Repository cần thiết
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import java.io.Serializable;
import java.util.UUID;

@Component
public class CustomPermissionEvaluator implements PermissionEvaluator {

    private final UserSubjectPermissionRepository permissionRepository;
    private final ChapterRepository chapterRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;

    public CustomPermissionEvaluator(UserSubjectPermissionRepository permissionRepository,
                                     ChapterRepository chapterRepository,
                                     ExamRepository examRepository, QuestionRepository questionRepository,
                                     AnswerRepository answerRepository) {
        this.permissionRepository = permissionRepository;
        this.chapterRepository = chapterRepository;
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
    }

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        return false;
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {

        // 1. Lấy User ID
        UUID currentUserId;
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            currentUserId = ((User) principal).getUserId();
        } else {
            return false;
        }

        // 2. Kiểm tra quyền ADMIN
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return true;
        }

        // 3. Tìm Subject ID dựa trên Target Type
        Long subjectId = findSubjectIdByTarget(targetId, targetType);

        if (subjectId == null) {
            // Không tìm thấy tài nguyên hoặc không thuộc Subject nào
            return false;
        }

        // 4. Kiểm tra quyền trên Subject gốc
        String permissionType = permission.toString().toUpperCase();
        return permissionRepository.existsByUserIdAndSubjectIdAndPermissionType(
                currentUserId,
                subjectId,
                permissionType
        );
    }

    // Phương thức hỗ trợ tìm Subject ID
    private Long findSubjectIdByTarget(Serializable targetId, String targetType) {
        Long id = (Long) targetId;

        return switch (targetType.toUpperCase()) {
            case "SUBJECT" -> id;
            case "CHAPTER" -> chapterRepository.findSubjectIdByChapterId(id).orElse(null);
            case "EXAM" -> examRepository.findSubjectIdByExamId(id).orElse(null);
            case "QUESTION" -> questionRepository.findSubjectIdByQuestionId(id).orElse(null);
            case "ANSWER" -> answerRepository.findSubjectIdByAnswerId(id).orElse(null);
            default -> null;
        };
    }
}