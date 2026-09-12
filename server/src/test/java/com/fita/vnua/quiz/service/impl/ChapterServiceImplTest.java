package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.ChapterDto;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Subject;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.service.SoftDeleteService;
import com.fita.vnua.quiz.service.mapper.ChapterMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChapterServiceImplTest {

    @Mock
    private ChapterRepository chapterRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private SoftDeleteService softDeleteService;

    @Spy
    private ChapterMapper chapterMapper = new ChapterMapper();

    @InjectMocks
    private ChapterServiceImpl chapterService;

    @Test
    @DisplayName("Lấy danh sách chương theo môn học được sắp xếp theo chapterNumber")
    void getChapterBySubject_returnsSortedChapters() {
        Long subjectId = 1L;

        Subject subject = new Subject();
        subject.setSubjectId(subjectId);

        Chapter chapter2 = new Chapter();
        chapter2.setChapterId(20L);
        chapter2.setName("Chương 2");
        chapter2.setChapterNumber(2);
        chapter2.setSubject(subject);

        Chapter chapter1 = new Chapter();
        chapter1.setChapterId(10L);
        chapter1.setName("Chương 1");
        chapter1.setChapterNumber(1);
        chapter1.setSubject(subject);

        when(chapterRepository.findBySubject(subjectId)).thenReturn(List.of(chapter2, chapter1));
        when(questionRepository.countActiveQuestionsByChapterIds(List.of(20L, 10L)))
                .thenReturn(List.<Object[]>of(new Object[]{20L, 5L}, new Object[]{10L, 10L}));

        List<ChapterDto> result = chapterService.getChapterBySubject(subjectId);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getChapterNumber()).isEqualTo(1);
        assertThat(result.get(0).getCountQuestion()).isEqualTo(10L);
        assertThat(result.get(1).getChapterNumber()).isEqualTo(2);
        assertThat(result.get(1).getCountQuestion()).isEqualTo(5L);
    }

    @Test
    @DisplayName("Tạo chương thành công khi dữ liệu hợp lệ")
    void create_validChapter_success() {
        Long subjectId = 1L;
        Subject subject = new Subject();
        subject.setSubjectId(subjectId);
        subject.setDeleted(false);

        ChapterDto requestDto = new ChapterDto();
        requestDto.setSubjectId(subjectId);
        requestDto.setName("Chương Mới");
        requestDto.setChapterNumber(1);

        when(subjectRepository.findById(subjectId)).thenReturn(Optional.of(subject));
        when(chapterRepository.existsByNameIgnoreCaseAndSubjectSubjectIdAndDeletedFalse("Chương Mới", subjectId)).thenReturn(false);
        when(chapterRepository.existsByChapterNumberAndSubjectSubjectIdAndDeletedFalse(1, subjectId)).thenReturn(false);

        Chapter savedEntity = new Chapter();
        savedEntity.setChapterId(100L);
        savedEntity.setName("Chương Mới");
        savedEntity.setChapterNumber(1);
        savedEntity.setSubject(subject);
        savedEntity.setDeleted(false);

        when(chapterRepository.save(any(Chapter.class))).thenReturn(savedEntity);

        ChapterDto created = chapterService.create(requestDto);

        assertThat(created.getChapterId()).isEqualTo(100L);
        assertThat(created.getName()).isEqualTo("Chương Mới");
        verify(chapterRepository).save(any(Chapter.class));
    }

    @Test
    @DisplayName("Ném lỗi khi tên chương đã tồn tại trong môn học")
    void create_duplicateName_throwsConflict() {
        Long subjectId = 1L;
        Subject subject = new Subject();
        subject.setSubjectId(subjectId);
        subject.setDeleted(false);

        ChapterDto requestDto = new ChapterDto();
        requestDto.setSubjectId(subjectId);
        requestDto.setName("Chương Đã Có");
        requestDto.setChapterNumber(1);

        when(subjectRepository.findById(subjectId)).thenReturn(Optional.of(subject));
        when(chapterRepository.existsByNameIgnoreCaseAndSubjectSubjectIdAndDeletedFalse("Chương Đã Có", subjectId)).thenReturn(true);

        assertThatThrownBy(() -> chapterService.create(requestDto))
                .isInstanceOf(CustomApiException.class)
                .hasMessageContaining("Tên chương đã tồn tại trong môn học")
                .satisfies(ex -> assertThat(((CustomApiException) ex).getStatus()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    @DisplayName("Xóa chương ủy quyền sang SoftDeleteService")
    void delete_invokesSoftDeleteService() {
        Long chapterId = 50L;

        chapterService.delete(chapterId);

        verify(softDeleteService).deleteChapter(chapterId, null);
    }
}