package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.enums.UserRole;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.ExamDto;
import com.fita.vnua.quiz.model.dto.ExamSummaryDto;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.generator.ExamQuestionId;
import com.fita.vnua.quiz.model.dto.request.ExamRequest;
import com.fita.vnua.quiz.model.entity.*;
import com.fita.vnua.quiz.repository.*;
import com.fita.vnua.quiz.service.ExamService;
import com.fita.vnua.quiz.service.NotificationService;
import com.fita.vnua.quiz.service.QuestionService;
import com.fita.vnua.quiz.service.SoftDeleteService;
import com.fita.vnua.quiz.service.UserExamService;
import com.fita.vnua.quiz.service.mapper.ExamMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {
    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;
    private final QuestionService questionService;
    private final ExamQuestionRepository examQuestionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final UserAnswerRepository userAnswerRepository;
    private final UserExamRepository userExamRepository;
    private final SoftDeleteService softDeleteService;
    private final UserExamService userExamService;
    private final QuestionDetailLoader questionDetailLoader;
    private final ExamQuestionSelectionService examQuestionSelectionService;
    private final ExamMapper examMapper;

    protected List<ExamSummaryDto> mapExamsToSummaryDtos(List<Exam> exams) {
        Map<Long, Long> questionCounts = countQuestionsByExam(exams);
        return exams.stream()
                .map(exam -> mapExamToSummaryDto(exam, questionCounts))
                .toList();
    }

    private ExamSummaryDto mapExamToSummaryDto(Exam exam, Map<Long, Long> questionCounts) {
        return examMapper.toSummaryDto(exam, questionCounts.getOrDefault(exam.getExamId(), 0L));
    }

    private Map<Long, Long> countQuestionsByExam(List<Exam> exams) {
        List<Long> examIds = exams.stream()
                .map(Exam::getExamId)
                .toList();
        if (examIds.isEmpty()) {
            return Map.of();
        }
        return examRepository.countQuestionsByExamIds(examIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));
    }

    @Override
    public List<ExamSummaryDto> getAllExams() {
        List<Exam> exams = examRepository.findByDeletedFalse();
        return mapExamsToSummaryDtos(exams);
    }

    @Override
    public List<ExamSummaryDto> getDeletedExams() {
        return mapExamsToSummaryDtos(examRepository.findByDeletedTrue());
    }

    @Override
    @Cacheable(value = "publicExamsBySubject", key = "#subjectId")
    public List<ExamSummaryDto> getExamsBySubjectId(Long subjectId) {
        List<Exam> exams = examRepository.findExamsBySubjectId(subjectId);
        return mapExamsToSummaryDtos(exams);
    }

    @Override
    public List<ExamSummaryDto> filterExams(String keyword, Long categoryId, Long subjectId, UUID createdBy, Boolean deleted, String sortBy, String sortDir) {
        String normalizedKeyword = keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();
        List<ExamSummaryDto> exams = mapExamsToSummaryDtos(
                examRepository.filterExams(normalizedKeyword, categoryId, subjectId, createdBy, deleted)
        );
        return AdminSortHelper.sort(exams, sortBy, sortDir, Map.of(
                "examId", ExamSummaryDto::getExamId,
                "examCode", ExamSummaryDto::getExamCode,
                "subjectId", ExamSummaryDto::getSubjectId,
                "subjectName", ExamSummaryDto::getSubjectName,
                "title", ExamSummaryDto::getTitle,
                "description", ExamSummaryDto::getDescription,
                "duration", ExamSummaryDto::getDuration,
                "createdDate", ExamSummaryDto::getCreatedDate,
                "questionCount", ExamSummaryDto::getQuestionCount,
                "deletedAt", ExamSummaryDto::getDeletedAt
        ));
    }

    @Override
    public Page<ExamSummaryDto> filterExamsPage(String keyword, Long categoryId, Long subjectId, UUID createdBy, Boolean deleted, Pageable pageable) {
        String normalizedKeyword = keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();
        Page<Exam> page = examRepository.filterExamsPage(normalizedKeyword, categoryId, subjectId, createdBy, deleted, pageable);
        Map<Long, Long> questionCounts = countQuestionsByExam(page.getContent());
        return page.map(exam -> mapExamToSummaryDto(exam, questionCounts));
    }

    @Override
    public Page<ExamSummaryDto> filterExamsPage(String keyword, Long categoryId, Long subjectId, UUID createdBy, Boolean deleted, int page, int size, String sortBy, String sortDir) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                resolveExamSort(sortBy, sortDir)
        );
        return filterExamsPage(keyword, categoryId, subjectId, createdBy, deleted, pageable);
    }

    @Override
    @Cacheable(value = "publicExamDetail", key = "#id")
    public ExamDto getExamById(Long id) {
        Exam exam = examRepository.findByExamIdAndDeletedFalse(id)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy bài thi", HttpStatus.NOT_FOUND));
        return examMapper.toDto(exam, questionService.getQuestionsByExamId(exam.getExamId()));
    }

    @Override
    @Transactional(readOnly = true)
    public ExamDto getPublicExamById(Long examId, boolean includeCorrectAnswers, Long userExamId, UUID currentUserId, boolean currentUserAdminOrMod) {
        ExamDto exam;
        if (includeCorrectAnswers) {
            requireCorrectAnswerAccess(examId, userExamId, currentUserId, currentUserAdminOrMod);
            exam = userExamId == null
                    ? getExamById(examId)
                    : getExamByIdForSubmittedAttempt(examId, userExamId, currentUserId);
        } else {
            exam = getExamById(examId);
            stripCorrectAnswers(exam);
        }
        return exam;
    }

    @Override
    @Transactional // Đảm bảo tính toàn vẹn dữ liệu
    @CacheEvict(value = {"publicSubjectDetail", "publicExamsBySubject", "publicExamDetail", "ranking"}, allEntries = true)
    public ExamDto createExam(ExamRequest examRequest, UUID currentUserId) {
        // 1. Tạo Exam mới & Lưu thông tin cơ bản
        ExamDto examDto = examRequest.getExamDto();
        Exam exam = new Exam();
        exam.setExamCode(resolveExamCode(examDto.getExamCode(), null));
        exam.setTitle(examDto.getTitle());

        // Lấy đối tượng Subject để dùng sau này cho việc gửi thông báo
        Subject subject = subjectRepository.findById(examDto.getSubjectId())
                .orElseThrow(() -> new CustomApiException("Không tìm thấy môn học", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(subject.getDeleted())) {
            throw new CustomApiException("Không tìm thấy môn học", HttpStatus.NOT_FOUND);
        }
        exam.setSubject(subject);

        exam.setDescription(examDto.getDescription());
        exam.setDuration(examDto.getDuration());
        exam.setCreatedBy(userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND)));
        exam.setCreatedTime(LocalDate.now());

        // Lưu lần 1 để lấy Exam ID
        exam = examRepository.save(exam);

        examDto.setExamId(exam.getExamId());
        examDto.setExamCode(exam.getExamCode());
        examDto.setCreatedBy(exam.getCreatedBy().getUserId());
        examDto.setCreatedDate(String.valueOf(exam.getCreatedTime()));

        List<QuestionDto> selectedQuestions = examQuestionSelectionService.resolveExamQuestions(examRequest, examDto.getSubjectId());
        saveQuestionsToExam(exam, selectedQuestions);
        examDto.setQuestions(selectedQuestions);

        // 3. --- TÍCH HỢP GỬI THÔNG BÁO TỰ ĐỘNG ---
        // Đặt ở cuối cùng để chắc chắn đề thi đã tạo thành công
        try {
            notificationService.sendSubjectNotification(
                    subject.getSubjectId(),    // ID môn học
                    subject.getName(),  // Tên môn học (Check lại getter trong Entity Subject của bạn)
                    exam.getExamId()           // ID đề thi để user click vào
            );
        } catch (Exception e) {
            // Log lỗi nhưng KHÔNG throw exception.
            // Để tránh việc tạo đề thi thành công mà thông báo lỗi lại rollback cả đề thi.
            log.warn("Không thể gửi thông báo cho đề thi {} thuộc môn {}", exam.getExamId(), subject.getSubjectId(), e);
        }

        return examDto;
    }

    // Hàm phụ mình tách ra để code đỡ bị lặp lại (Optional - bạn dùng hay không tùy ý)
    private void saveQuestionsToExam(Exam exam, List<QuestionDto> questionDtos) {
        Set<Long> questionIds = questionDtos.stream()
                .map(QuestionDto::getQuestionId)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        List<Question> allQuestions = questionDetailLoader.loadByIdsInSameOrder(new ArrayList<>(questionIds));
        Map<Long, Question> questionById = allQuestions.stream()
                .collect(Collectors.toMap(Question::getQuestionId, question -> question));

        for (Long questionId : questionIds) {
            Question question = questionById.get(questionId);
            if (question == null) {
                throw new CustomApiException("Không tìm thấy câu hỏi", HttpStatus.NOT_FOUND);
            }
            ExamQuestionId examQuestionId = new ExamQuestionId();
            examQuestionId.setExamId(exam.getExamId());
            examQuestionId.setQuestionId(question.getQuestionId());

            ExamQuestion examQuestion = new ExamQuestion();
            examQuestion.setExam(exam);
            examQuestion.setQuestion(question);
            examQuestion.setId(examQuestionId);

            examQuestionRepository.save(examQuestion);
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = {"publicSubjectDetail", "publicExamsBySubject", "publicExamDetail", "ranking"}, allEntries = true)
    public ExamDto updateExam(Long id, ExamDto examDto) {
        Exam exam = examRepository.findByExamIdAndDeletedFalse(id)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy bài thi", HttpStatus.NOT_FOUND));
        exam.setExamCode(resolveExamCode(examDto.getExamCode(), id));
        exam.setTitle(examDto.getTitle());
        exam.setDescription(examDto.getDescription());
        exam.setDuration(examDto.getDuration());
        if (examDto.getSubjectId() != null) {
            if (!examDto.getSubjectId().equals(exam.getSubject().getSubjectId()) && examDto.getQuestions() == null) {
                throw new CustomApiException("Doi mon hoc cua de thi can gui lai danh sach cau hoi moi.", HttpStatus.BAD_REQUEST);
            }
            Subject subject = subjectRepository.findById(examDto.getSubjectId())
                    .orElseThrow(() -> new CustomApiException("Không tìm thấy môn học", HttpStatus.NOT_FOUND));
            if (Boolean.TRUE.equals(subject.getDeleted())) {
                throw new CustomApiException("Không tìm thấy môn học", HttpStatus.NOT_FOUND);
            }
            exam.setSubject(subject);
        }
        Exam updatedExam = examRepository.save(exam);

        if (examDto.getQuestions() != null) {
            examQuestionSelectionService.validateSelectedQuestions(examDto.getQuestions(), updatedExam.getSubject().getSubjectId());
            examQuestionRepository.deleteByExamId(updatedExam.getExamId());
            saveQuestionsToExam(updatedExam, examDto.getQuestions());
        }

        return examMapper.toDto(updatedExam, questionService.getQuestionsByExamId(updatedExam.getExamId()));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"publicSubjectDetail", "publicExamsBySubject", "publicExamDetail", "ranking"}, allEntries = true)
    public void deleteExam(Long id) {
        softDeleteService.deleteExam(id, null);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"publicSubjectDetail", "publicExamsBySubject", "publicExamDetail", "ranking"}, allEntries = true)
    public ExamDto restoreExam(Long id) {
        softDeleteService.restoreExam(id);
        if (examQuestionRepository.countValidQuestionsForExam(id) == 0) {
            softDeleteService.deleteExam(id, null);
            throw new CustomApiException("De thi khong con cau hoi hop le. Vui long cap nhat cau hoi truoc khi khoi phuc.", HttpStatus.BAD_REQUEST);
        }
        return getExamById(id);
    }

    @Override
    public ExamDto getExamByIdForSubmittedAttempt(Long examId, Long userExamId, UUID currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomApiException("Bạn không có quyền truy cập bài thi này", HttpStatus.FORBIDDEN));
        UserExam userExam = (currentUser.getRole() == UserRole.ADMIN || currentUser.getRole() == UserRole.MOD)
                ? userExamRepository.findByIdWithExamSubjectAndUser(userExamId).orElseThrow(() -> new CustomApiException("Bạn không có quyền truy cập bài thi này", HttpStatus.FORBIDDEN))
                : userExamRepository.findByIdAndUserId(userExamId, currentUserId)
                        .orElseThrow(() -> new CustomApiException("Bạn không có quyền truy cập bài thi này", HttpStatus.FORBIDDEN));
        if (!examId.equals(userExam.getExam().getExamId()) || !"SUBMITTED".equals(userExam.getStatus())) {
            throw new CustomApiException("Bạn không có quyền truy cập bài thi này", HttpStatus.FORBIDDEN);
        }
        List<QuestionDto> questions = userExamService.getAttemptQuestionDtosForSubmittedAttempt(userExamId, currentUserId);
        return examMapper.toDto(userExam.getExam(), questions);
    }

    private void requireCorrectAnswerAccess(Long examId, Long userExamId, UUID currentUserId, boolean currentUserAdminOrMod) {
        if (currentUserId == null) {
            throw new CustomApiException("Bạn không có quyền xem đáp án bài thi này", HttpStatus.FORBIDDEN);
        }
        if (currentUserAdminOrMod) {
            return;
        }
        if (userExamId == null) {
            throw new CustomApiException("Bạn không có quyền xem đáp án bài thi này", HttpStatus.FORBIDDEN);
        }
        UserExam userExam = userExamRepository.findByIdAndUserId(userExamId, currentUserId)
                .orElseThrow(() -> new CustomApiException("Bạn không có quyền xem đáp án bài thi này", HttpStatus.FORBIDDEN));
        if (!examId.equals(userExam.getExam().getExamId()) || !"SUBMITTED".equals(userExam.getStatus())) {
            throw new CustomApiException("Bạn không có quyền xem đáp án bài thi này", HttpStatus.FORBIDDEN);
        }
    }

    private ExamDto stripCorrectAnswers(ExamDto exam) {
        if (exam.getQuestions() == null) {
            return exam;
        }
        exam.getQuestions().forEach(question -> {
            if (question.getAnswers() != null) {
                question.getAnswers().forEach(answer -> answer.setIsCorrect(null));
            }
        });
        return exam;
    }

    private Sort resolveExamSort(String sortBy, String sortDir) {
        String property = switch (sortBy == null ? "" : sortBy) {
            case "subjectId" -> "subject.subjectId";
            case "subjectName" -> "subject.name";
            case "examCode" -> "examCode";
            case "title" -> "title";
            case "description" -> "description";
            case "duration" -> "duration";
            case "createdDate" -> "createdTime";
            case "deletedAt" -> "deletedAt";
            default -> "examId";
        };
        Sort.Direction direction = "ascend".equalsIgnoreCase(sortDir) || "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return Sort.by(direction, property);
    }

    private String resolveExamCode(String rawExamCode, Long currentExamId) {
        String examCode = normalizeExamCode(rawExamCode);
        if (examCode == null) {
            examCode = generateExamCode();
        }
        boolean duplicated = currentExamId == null
                ? examRepository.existsByExamCodeIgnoreCase(examCode)
                : examRepository.existsByExamCodeIgnoreCaseAndExamIdNot(examCode, currentExamId);
        if (duplicated) {
            throw new CustomApiException("Ma de da ton tai", HttpStatus.BAD_REQUEST);
        }
        return examCode;
    }

    private String normalizeExamCode(String rawExamCode) {
        if (rawExamCode == null || rawExamCode.isBlank()) {
            return null;
        }
        String examCode = rawExamCode.trim().toUpperCase().replaceAll("\\s+", "-");
        if (examCode.length() > 64) {
            throw new CustomApiException("Ma de khong duoc vuot qua 64 ky tu", HttpStatus.BAD_REQUEST);
        }
        if (!examCode.matches("[A-Z0-9._-]+")) {
            throw new CustomApiException("Ma de chi duoc chua chu cai, so, dau cham, gach ngang hoac gach duoi", HttpStatus.BAD_REQUEST);
        }
        return examCode;
    }

    private String generateExamCode() {
        String examCode;
        do {
            examCode = "EXAM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (examRepository.existsByExamCodeIgnoreCase(examCode));
        return examCode;
    }
}
