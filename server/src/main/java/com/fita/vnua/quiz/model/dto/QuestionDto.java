package com.fita.vnua.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class QuestionDto extends SoftDeleteMetadataDto {
    private Long questionId;
    private String content;
    private String difficulty;
    private Long chapterId;
    private String chapterName;
    private String imageUrl;
    private String questionType;
    private Boolean examEnabled;
    private Boolean practiceEnabled;
    private List<AnswerDto> answers;
}
