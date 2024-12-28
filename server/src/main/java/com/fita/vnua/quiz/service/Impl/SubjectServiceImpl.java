package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.ChapterDto;
import com.fita.vnua.quiz.model.dto.SubjectDto;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.model.entity.Subject;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.service.SubjectService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectServiceImpl implements SubjectService {
    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<SubjectDto> getAllSubject() {
        List<SubjectDto> subjects = subjectRepository.findAll().stream().map(subject -> modelMapper.map(subject, SubjectDto.class)).toList();
        for (SubjectDto subject : subjects) {
            List<ChapterDto> chapterDtos = chapterRepository.findBySubject(subject.getSubjectId()).stream().map(chapter -> modelMapper.map(chapter, ChapterDto.class)).toList();
            subject.setChapters(chapterDtos);
        }
        return subjects;
    }

    @Override
    public SubjectDto getSubjectById(Long subjectId) {
        SubjectDto subjectDto = modelMapper.map(subjectRepository.findById(subjectId), SubjectDto.class);
        subjectDto.setChapters(chapterRepository.findBySubject(subjectId).stream().map(chapter -> modelMapper.map(chapter, ChapterDto.class)).toList());
        return subjectDto;
    }

    @Override
    public SubjectDto create(SubjectDto subjectDto) {
        Subject subject = subjectRepository.save(modelMapper.map(subjectDto, Subject.class));
        Subject savedSubject = subjectRepository.save(subject);
        return modelMapper.map(savedSubject, SubjectDto.class);
    }

    @Override
    public SubjectDto update(Long subjectId, SubjectDto subjectDto) {
        var existingSubject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new EntityNotFoundException("Subject not found"));

        existingSubject.setName(subjectDto.getName());
        existingSubject.setDescription(subjectDto.getDescription());
        return modelMapper.map(subjectRepository.save(existingSubject), SubjectDto.class);
    }

    @Override
    public Response delete(Long subjectId) {
        var existingSubject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new EntityNotFoundException("Subject not found"));
        subjectRepository.delete(existingSubject);
        return Response.builder()
                .responseMessage("Subject deleted successfully")
                .responseCode("200 OK").build();
    }
}
