package com.fita.vnua.quiz.utils;

import com.fita.vnua.quiz.model.dto.AnswerDto;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

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
                    throw new RuntimeException("Difficulty không hợp lệ: " + difficulty);
                }
                questionDto.setDifficulty(difficulty);

                // Lấy đáp án đúng ký tự ở cột 6 (index 6)
                Cell correctCell = currentRow.getCell(6, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                String correctOption = correctCell != null ? formatter.formatCellValue(correctCell).trim() : "";

                String[] options = {"A", "B", "C", "D"};

                // Lấy 4 đáp án từ cột 2,3,4,5 (index 2..5)
                for (int i = 0; i < 4; i++) {
                    Cell answerCell = currentRow.getCell(i + 2, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                    String answerContent = answerCell != null ? formatter.formatCellValue(answerCell) : "";

                    AnswerDto answerDto = new AnswerDto();
                    answerDto.setContent(answerContent);
                    answerDto.setIsCorrect(options[i].equalsIgnoreCase(correctOption));
                    answers.add(answerDto);
                }

                questionDto.setAnswers(answers);
                questionList.add(questionDto);
            }

            return questionList;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi đọc file Excel: " + e.getMessage(), e);
        }
    }

}
