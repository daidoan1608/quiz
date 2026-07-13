package com.fita.vnua.quiz.utils;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.AnswerDto;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class ExcelHelper {

    public static List<QuestionDto> excelToQuestions(InputStream is) {
        try (Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            List<QuestionDto> questionList = new ArrayList<>();
            if (rows.hasNext()) rows.next(); // Bỏ qua header

            DataFormatter formatter = new DataFormatter();  // Sử dụng DataFormatter để chuyển đổi các giá trị thành chuỗi

            while (rows.hasNext()) {
                Row currentRow = rows.next();
                QuestionDto questionDto = new QuestionDto();
                List<AnswerDto> answers = new ArrayList<>();

                // Lấy nội dung câu hỏi cột 0
                Cell contentCell = currentRow.getCell(0, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                questionDto.setContent(contentCell != null ? formatter.formatCellValue(contentCell) : "");

                // Lấy difficulty cột 1
                Cell diffCell = currentRow.getCell(1, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                String difficulty = diffCell != null ? formatter.formatCellValue(diffCell).trim() : ""; // Bỏ khoảng trống

                // Kiểm tra nếu difficulty không hợp lệ sau khi bỏ khoảng trống
                if (!difficulty.equalsIgnoreCase("EASY") && !difficulty.equalsIgnoreCase("MEDIUM") && !difficulty.equalsIgnoreCase("HARD")) {
                    throw new CustomApiException("Difficulty không hợp lệ: " + difficulty, HttpStatus.BAD_REQUEST);
                }
                questionDto.setDifficulty(difficulty);

                // Lấy đáp án đúng ký tự ở cột 6 (index 6)
                Cell correctCell = currentRow.getCell(6, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                String correctOption = correctCell != null ? formatter.formatCellValue(correctCell).trim().toUpperCase() : "";
                Set<String> correctOptions = parseCorrectOptions(correctOption);

                String[] options = {"A", "B", "C", "D"};

                // Lấy 4 đáp án từ cột 2,3,4,5 (index 2..5)
                for (int i = 0; i < 4; i++) {
                    Cell answerCell = currentRow.getCell(i + 2, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                    String answerContent = answerCell != null ? formatter.formatCellValue(answerCell).trim() : "";
                    if (answerContent.isBlank()) {
                        continue;
                    }

                    AnswerDto answerDto = new AnswerDto();
                    answerDto.setContent(answerContent);
                    answerDto.setIsCorrect(correctOptions.contains(options[i]));
                    answers.add(answerDto);
                }

                // Lấy imageUrl ở cột 7 (index 7 - optional)
                Cell imgCell = currentRow.getCell(7, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                questionDto.setImageUrl(imgCell != null ? formatter.formatCellValue(imgCell).trim() : null);

                // Lấy questionType ở cột 8 (index 8 - optional)
                Cell typeCell = currentRow.getCell(8, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                String typeVal = typeCell != null ? formatter.formatCellValue(typeCell).trim().toUpperCase() : "SINGLE_CHOICE";
                questionDto.setQuestionType(typeVal);

                questionDto.setAnswers(answers);
                questionList.add(questionDto);
            }

            return questionList;
        } catch (CustomApiException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomApiException("Lỗi khi đọc file Excel: " + e.getMessage(), e);
        }
    }

    private static Set<String> parseCorrectOptions(String correctOption) {
        return correctOption.chars()
                .mapToObj(value -> String.valueOf((char) value))
                .filter(value -> value.matches("[A-D]"))
                .collect(Collectors.toSet());
    }

}
