package com.fita.vnua.quiz.security;

import com.fita.vnua.quiz.model.enums.UserRole;

import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.AnswerRepository;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.ExamRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.service.AdminCapabilityService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomPermissionEvaluatorTest {
    @Mock
    private ChapterRepository chapterRepository;
    @Mock
    private ExamRepository examRepository;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private AnswerRepository answerRepository;
    @Mock
    private SubjectRepository subjectRepository;
    @Mock
    private AdminCapabilityService adminCapabilityService;

    @Test
    void modPermissionPassesForActiveSubject() {
        UUID userId = UUID.randomUUID();
        Long subjectId = 10L;
        CustomPermissionEvaluator evaluator = evaluator();

        when(subjectRepository.findActiveSubjectId(subjectId)).thenReturn(Optional.of(subjectId));
        when(adminCapabilityService.hasPermission(org.mockito.ArgumentMatchers.any(User.class), org.mockito.ArgumentMatchers.eq("SUBJECT"), org.mockito.ArgumentMatchers.eq("UPDATE"), org.mockito.ArgumentMatchers.eq("SUBJECT"), org.mockito.ArgumentMatchers.eq(subjectId)))
                .thenReturn(true);

        boolean allowed = evaluator.hasPermission(authentication(userId, UserRole.MOD, false), subjectId, "Subject", "update");

        assertThat(allowed).isTrue();
    }

    @Test
    void modPermissionDeniesDeletedTarget() {
        UUID userId = UUID.randomUUID();
        Long subjectId = 10L;
        CustomPermissionEvaluator evaluator = evaluator();

        when(subjectRepository.findActiveSubjectId(subjectId)).thenReturn(Optional.empty());

        boolean allowed = evaluator.hasPermission(authentication(userId, UserRole.MOD, false), subjectId, "Subject", "UPDATE");

        assertThat(allowed).isFalse();
        verify(adminCapabilityService, never()).hasPermission(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void deletedPrincipalIsDenied() {
        UUID userId = UUID.randomUUID();
        CustomPermissionEvaluator evaluator = evaluator();

        boolean allowed = evaluator.hasPermission(authentication(userId, UserRole.MOD, true), 10L, "Subject", "UPDATE");

        assertThat(allowed).isFalse();
        verify(subjectRepository, never()).findActiveSubjectId(10L);
    }

    private CustomPermissionEvaluator evaluator() {
        return new CustomPermissionEvaluator(
                chapterRepository,
                examRepository,
                questionRepository,
                answerRepository,
                subjectRepository,
                adminCapabilityService
        );
    }

    private UsernamePasswordAuthenticationToken authentication(UUID userId, UserRole role, boolean deleted) {
        User user = new User();
        user.setUserId(userId);
        user.setRole(role);
        user.setDeleted(deleted);
        return new UsernamePasswordAuthenticationToken(
                user,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))
        );
    }
}
