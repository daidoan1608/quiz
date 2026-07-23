package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.enums.UserRole;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fita.vnua.quiz.model.dto.ExamDto;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.SubjectDto;
import com.fita.vnua.quiz.model.dto.response.UserExamResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.AnswerRepository;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.ExamRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.repository.UserExamRepository;
import com.fita.vnua.quiz.service.AdminCapabilityService;
import com.fita.vnua.quiz.service.AuditLogService;
import com.fita.vnua.quiz.service.ExamService;
import com.fita.vnua.quiz.service.QuestionService;
import com.fita.vnua.quiz.service.SubjectService;
import com.fita.vnua.quiz.service.UserExamService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ModEndpointPermissionTest {

    private static final long SUBJECT_ID = 7L;
    private static final long QUESTION_ID = 11L;
    private static final long EXAM_ID = 13L;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private QuestionService questionService;

    @MockBean
    private ExamService examService;

    @MockBean
    private SubjectService subjectService;

    @MockBean
    private UserExamService userExamService;

    @MockBean
    private AuditLogService auditLogService;

    @MockBean
    private ChapterRepository chapterRepository;

    @MockBean
    private ExamRepository examRepository;

    @MockBean
    private QuestionRepository questionRepository;

    @MockBean
    private AnswerRepository answerRepository;

    @MockBean
    private SubjectRepository subjectRepository;

    @MockBean
    private UserExamRepository userExamRepository;

    @MockBean
    private AdminCapabilityService adminCapabilityService;

    @Test
    void modCanUpdateQuestionWhenSubjectPermissionAllowsUpdate() throws Exception {
        User mod = modUser();
        QuestionDto response = new QuestionDto();
        response.setQuestionId(QUESTION_ID);
        response.setContent("Updated question");

        when(questionRepository.findActiveSubjectIdByQuestionId(QUESTION_ID)).thenReturn(Optional.of(SUBJECT_ID));
        when(adminCapabilityService.hasPermission(eq(mod), eq("QUESTION"), eq("UPDATE"), eq("SUBJECT"), eq(SUBJECT_ID)))
                .thenReturn(true);
        when(questionService.update(eq(QUESTION_ID), any(QuestionDto.class))).thenReturn(response);

        mockMvc.perform(patch("/api/v1/admin/questions/{questionId}", QUESTION_ID)
                        .with(authentication(authenticationFor(mod)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new QuestionDto())))
                .andExpect(status().isOk());

        verify(questionService).update(eq(QUESTION_ID), any(QuestionDto.class));
    }

    @Test
    void modCannotUpdateQuestionWithoutSubjectPermission() throws Exception {
        User mod = modUser();
        when(questionRepository.findActiveSubjectIdByQuestionId(QUESTION_ID)).thenReturn(Optional.of(SUBJECT_ID));
        when(adminCapabilityService.hasPermission(eq(mod), eq("QUESTION"), eq("UPDATE"), eq("SUBJECT"), eq(SUBJECT_ID)))
                .thenReturn(false);

        mockMvc.perform(patch("/api/v1/admin/questions/{questionId}", QUESTION_ID)
                        .with(authentication(authenticationFor(mod)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new QuestionDto())))
                .andExpect(status().isForbidden());

        verify(questionService, never()).update(any(), any());
    }

    @Test
    void modCanUpdateExamWhenSubjectPermissionAllowsUpdate() throws Exception {
        User mod = modUser();
        ExamDto response = new ExamDto();
        response.setExamId(EXAM_ID);
        response.setTitle("Updated exam");

        when(examRepository.findActiveSubjectIdByExamId(EXAM_ID)).thenReturn(Optional.of(SUBJECT_ID));
        when(adminCapabilityService.hasPermission(eq(mod), eq("EXAM"), eq("UPDATE"), eq("SUBJECT"), eq(SUBJECT_ID)))
                .thenReturn(true);
        when(examService.updateExam(eq(EXAM_ID), any(ExamDto.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/admin/exams/{examId}", EXAM_ID)
                        .with(authentication(authenticationFor(mod)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ExamDto())))
                .andExpect(status().isOk());

        verify(examService).updateExam(eq(EXAM_ID), any(ExamDto.class));
    }

    @Test
    void modCannotUpdateExamWithoutSubjectPermission() throws Exception {
        User mod = modUser();
        when(examRepository.findActiveSubjectIdByExamId(EXAM_ID)).thenReturn(Optional.of(SUBJECT_ID));
        when(adminCapabilityService.hasPermission(eq(mod), eq("EXAM"), eq("UPDATE"), eq("SUBJECT"), eq(SUBJECT_ID)))
                .thenReturn(false);

        mockMvc.perform(put("/api/v1/admin/exams/{examId}", EXAM_ID)
                        .with(authentication(authenticationFor(mod)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ExamDto())))
                .andExpect(status().isForbidden());

        verify(examService, never()).updateExam(any(), any());
    }

    @Test
    void modCanUpdateSubjectWhenSubjectPermissionAllowsUpdate() throws Exception {
        User mod = modUser();
        SubjectDto response = new SubjectDto();
        response.setSubjectId(SUBJECT_ID);
        response.setName("Updated subject");

        when(subjectRepository.findActiveSubjectId(SUBJECT_ID)).thenReturn(Optional.of(SUBJECT_ID));
        when(adminCapabilityService.hasPermission(eq(mod), eq("SUBJECT"), eq("UPDATE"), eq("SUBJECT"), eq(SUBJECT_ID)))
                .thenReturn(true);
        when(subjectService.update(eq(SUBJECT_ID), any(SubjectDto.class))).thenReturn(response);

        mockMvc.perform(patch("/api/v1/admin/subjects/{subjectId}", SUBJECT_ID)
                        .with(authentication(authenticationFor(mod)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubjectDto())))
                .andExpect(status().isOk());

        verify(subjectService).update(eq(SUBJECT_ID), any(SubjectDto.class));
    }

    @Test
    void modCannotUpdateSubjectWithoutSubjectPermission() throws Exception {
        User mod = modUser();
        when(subjectRepository.findActiveSubjectId(SUBJECT_ID)).thenReturn(Optional.of(SUBJECT_ID));
        when(adminCapabilityService.hasPermission(eq(mod), eq("SUBJECT"), eq("UPDATE"), eq("SUBJECT"), eq(SUBJECT_ID)))
                .thenReturn(false);

        mockMvc.perform(patch("/api/v1/admin/subjects/{subjectId}", SUBJECT_ID)
                        .with(authentication(authenticationFor(mod)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubjectDto())))
                .andExpect(status().isForbidden());

        verify(subjectService, never()).update(any(), any());
    }

    @Test
    void modCannotCallAdminOnlyQuestionExamSubjectListEndpoints() throws Exception {
        User mod = modUser();

        mockMvc.perform(get("/api/v1/admin/questions")
                        .with(authentication(authenticationFor(mod))))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/admin/exams")
                        .with(authentication(authenticationFor(mod))))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/admin/subjects/deleted")
                        .with(authentication(authenticationFor(mod))))
                .andExpect(status().isForbidden());

        verify(questionService, never()).getAllQuestion();
        verify(examService, never()).getAllExams();
        verify(subjectService, never()).getDeletedSubjects();
    }

    @Test
    void modCanViewUserExamDetailWhenSubjectPermissionAllowsView() throws Exception {
        User mod = modUser();
        UserExamResponse response = UserExamResponse.builder().build();

        when(userExamRepository.findSubjectIdByUserExamId(EXAM_ID)).thenReturn(Optional.of(SUBJECT_ID));
        when(adminCapabilityService.hasPermission(eq(mod), eq("USER_EXAM"), eq("VIEW"), eq("GLOBAL"), eq(null)))
                .thenReturn(false);
        when(adminCapabilityService.hasPermission(eq(mod), eq("USER_EXAM"), eq("VIEW"), eq("SUBJECT"), eq(SUBJECT_ID)))
                .thenReturn(true);
        when(userExamService.getUserExamByIdForAdmin(EXAM_ID)).thenReturn(response);

        mockMvc.perform(get("/api/v1/user-exams/{userExamId}", EXAM_ID)
                        .with(authentication(authenticationFor(mod))))
                .andExpect(status().isOk());

        verify(userExamService).getUserExamByIdForAdmin(EXAM_ID);
    }

    @Test
    void modCannotViewUserExamDetailWithoutSubjectPermission() throws Exception {
        User mod = modUser();

        when(userExamRepository.findSubjectIdByUserExamId(EXAM_ID)).thenReturn(Optional.of(SUBJECT_ID));
        when(adminCapabilityService.hasPermission(eq(mod), eq("USER_EXAM"), eq("VIEW"), eq("GLOBAL"), eq(null)))
                .thenReturn(false);
        when(adminCapabilityService.hasPermission(eq(mod), eq("USER_EXAM"), eq("VIEW"), eq("SUBJECT"), eq(SUBJECT_ID)))
                .thenReturn(false);

        mockMvc.perform(get("/api/v1/user-exams/{userExamId}", EXAM_ID)
                        .with(authentication(authenticationFor(mod))))
                .andExpect(status().isForbidden());

        verify(userExamService, never()).getUserExamByIdForAdmin(any());
    }

    @Test
    void modCannotFilterUserExamsWhenSubjectDoesNotBelongToCategory() throws Exception {
        User mod = modUser();

        when(adminCapabilityService.hasPermission(eq(mod), eq("USER_EXAM"), eq("VIEW"), eq("GLOBAL"), eq(null)))
                .thenReturn(false);
        when(adminCapabilityService.hasPermission(eq(mod), eq("USER_EXAM"), eq("VIEW"), eq("SUBJECT"), eq(SUBJECT_ID)))
                .thenReturn(true);
        when(subjectRepository.existsActiveSubjectInCategory(SUBJECT_ID, 99L)).thenReturn(false);

        mockMvc.perform(get("/api/v1/admin/user-exams")
                        .param("subjectId", String.valueOf(SUBJECT_ID))
                        .param("categoryId", "99")
                        .with(authentication(authenticationFor(mod))))
                .andExpect(status().isForbidden());

        verify(userExamService, never()).getAllUserExamsForAdmin(any(), any(), any(), any(), any(), any());
    }

    @Test
    void modCanFilterUserExamsWithinAllowedSubjectCategory() throws Exception {
        User mod = modUser();

        when(adminCapabilityService.hasPermission(eq(mod), eq("USER_EXAM"), eq("VIEW"), eq("GLOBAL"), eq(null)))
                .thenReturn(false);
        when(adminCapabilityService.hasPermission(eq(mod), eq("USER_EXAM"), eq("VIEW"), eq("SUBJECT"), eq(SUBJECT_ID)))
                .thenReturn(true);
        when(subjectRepository.existsActiveSubjectInCategory(SUBJECT_ID, 3L)).thenReturn(true);
        when(userExamService.getAllUserExamsForAdmin(any(), eq(3L), eq(SUBJECT_ID), any(), any(), any()))
                .thenReturn(Page.empty());

        mockMvc.perform(get("/api/v1/admin/user-exams")
                        .param("subjectId", String.valueOf(SUBJECT_ID))
                        .param("categoryId", "3")
                        .with(authentication(authenticationFor(mod))))
                .andExpect(status().isOk());

        verify(userExamService).getAllUserExamsForAdmin(any(), eq(3L), eq(SUBJECT_ID), any(), any(), any());
    }

    private User modUser() {
        User user = new User();
        user.setUserId(UUID.randomUUID());
        user.setUsername("mod");
        user.setRole(UserRole.MOD);
        user.setDeleted(false);
        return user;
    }

    private UsernamePasswordAuthenticationToken authenticationFor(User user) {
        return new UsernamePasswordAuthenticationToken(
                user,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
