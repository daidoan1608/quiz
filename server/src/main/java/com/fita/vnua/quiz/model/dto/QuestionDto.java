package com.fita.vnua.quiz.model.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionDto {
    private Long questionId; // Mã câu hỏi
    private String content;   // Nội dung câu hỏi
    private String difficulty; // Mức độ khó của câu hỏi
    private Long chapterId;   // ID của chương
    private String chapterName; // Tên chương (có thể là thông tin bổ sung)
    private String imageUrl;    // Đường dẫn hình ảnh minh họa
    private String questionType; // Loại câu hỏi: SINGLE_CHOICE, MULTIPLE_CHOICE, FILL_IN_THE_BLANK
    private Boolean deleted; // Trạng thái xóa mềm
    private LocalDateTime deletedAt; // Thời điểm xóa mềm
    private UUID deletedBy; // Người thực hiện xóa mềm
    private UUID deletedCascadeId;
    private String deleteOriginType;
    private Long deleteOriginId;
    private List<AnswerDto> answers; // Danh sách đáp án cho câu hỏi này
}
