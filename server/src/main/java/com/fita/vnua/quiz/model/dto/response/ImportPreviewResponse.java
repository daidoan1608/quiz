package com.fita.vnua.quiz.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ImportPreviewResponse {
    private int totalRows;
    private int validRows;
    private int invalidRows;
    private List<String> errors;
}
