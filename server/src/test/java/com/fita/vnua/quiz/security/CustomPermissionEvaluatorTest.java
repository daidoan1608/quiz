package com.fita.vnua.quiz.security;

import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.AnswerRepository;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.ExamRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.repository.UserSubjectPermissionRepository;
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
    private UserSubjectPermissionRepository permissionRepository;
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

    @Test
    void modPermissionPassesForActiveSubject() {
        UUID userId = UUID.randomUUID();
        Long subjectId = 10L;
        CustomPermissionEvaluator evaluator = evaluator();

        when(subjectRepository.findActiveSubjectId(subjectId)).thenReturn(Optional.of(subjectId));
        when(permissionRepository.existsByUserIdAndSubjectIdAndPermissionType(userId, subjectId, "UPDATE"))
                .thenReturn(true);

        boolean allowed = evaluator.hasPermission(authentication(userId, User.Role.MOD, false), subjectId, "Subject", "update");

        assertThat(allowed).isTrue();
    }

    @Test
    void modPermissionDeniesDeletedTarget() {
        UUID userId = UUID.randomUUID();
        Long subjectId = 10L;
        CustomPermissionEvaluator evaluator = evaluator();

        when(subjectRepository.findActiveSubjectId(subjectId)).thenReturn(Optional.empty());

        boolean allowed = evaluator.hasPermission(authentication(userId, User.Role.MOD, false), subjectId, "Subject", "UPDATE");

        assertThat(allowed).isFalse();
        verify(permissionRepository, never()).existsByUserIdAndSubjectIdAndPermissionType(userId, subjectId, "UPDATE");
    }

    @Test
    void deletedPrincipalIsDenied() {
        UUID userId = UUID.randomUUID();
        CustomPermissionEvaluator evaluator = evaluator();

        boolean allowed = evaluator.hasPermission(authentication(userId, User.Role.MOD, true), 10L, "Subject", "UPDATE");

        assertThat(allowed).isFalse();
        verify(subjectRepository, never()).findActiveSubjectId(10L);
    }

    private CustomPermissionEvaluator evaluator() {
        return new CustomPermissionEvaluator(
                permissionRepository,
                chapterRepository,
                examRepository,
                questionRepository,
                answerRepository,
                subjectRepository
        );
    }

    private UsernamePasswordAuthenticationToken authentication(UUID userId, User.Role role, boolean deleted) {
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
