package com.fita.vnua.quiz.model.dto.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OperationResult {
    private String responseCode;
    private String responseMessage;
}
