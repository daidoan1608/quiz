package com.fita.vnua.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionDto {
    private Long questionId;
    private String content;
    private String difficulty;
    private Long chapterId;
    private String chapterName;
    private String imageUrl;
    private String questionType;
    private Boolean examEnabled;
    private Boolean practiceEnabled;
    private Boolean deleted;
    private LocalDateTime deletedAt;
    private UUID deletedBy;
    private UUID deletedCascadeId;
    private String deleteOriginType;
    private Long deleteOriginId;
    private List<AnswerDto> answers;
}
