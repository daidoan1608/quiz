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
    private final SubjectRepository subjectRepository;

    public CustomPermissionEvaluator(UserSubjectPermissionRepository permissionRepository,
                                     ChapterRepository chapterRepository,
                                     ExamRepository examRepository, QuestionRepository questionRepository,
                                     AnswerRepository answerRepository,
                                     SubjectRepository subjectRepository) {
        this.permissionRepository = permissionRepository;
        this.chapterRepository = chapterRepository;
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.subjectRepository = subjectRepository;
    }

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        return false;
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        if (authentication == null || targetId == null || targetType == null || permission == null) {
            return false;
        }

        // 1. Lấy User ID
        UUID currentUserId;
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            User currentUser = (User) principal;
            if (Boolean.TRUE.equals(currentUser.getDeleted())) {
                return false;
            }
            currentUserId = currentUser.getUserId();
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
        Long id = toLong(targetId);
        if (id == null) {
            return null;
        }

        return switch (targetType.toUpperCase()) {
            case "SUBJECT" -> subjectRepository.findActiveSubjectId(id).orElse(null);
            case "CHAPTER" -> chapterRepository.findActiveSubjectIdByChapterId(id).orElse(null);
            case "EXAM" -> examRepository.findActiveSubjectIdByExamId(id).orElse(null);
            case "QUESTION" -> questionRepository.findActiveSubjectIdByQuestionId(id).orElse(null);
            case "ANSWER" -> answerRepository.findActiveSubjectIdByAnswerId(id).orElse(null);
            default -> null;
        };
    }

    private Long toLong(Serializable targetId) {
        if (targetId instanceof Long value) {
            return value;
        }
        if (targetId instanceof Integer value) {
            return value.longValue();
        }
        if (targetId instanceof String value) {
            try {
                return Long.parseLong(value);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }
}
