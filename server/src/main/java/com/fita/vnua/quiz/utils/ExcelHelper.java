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
        try {
            Workbook workbook = new XSSFWorkbook(is);
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            List<QuestionDto> questionList = new ArrayList<>();
            rows.next(); // Bỏ qua dòng tiêu đề

            while (rows.hasNext()) {
                Row currentRow = rows.next();
                QuestionDto questionDto = new QuestionDto();
                List<AnswerDto> answers = new ArrayList<>();

                questionDto.setContent(currentRow.getCell(1).getStringCellValue());
                questionDto.setDifficulty(currentRow.getCell(2).getStringCellValue());

                // Đọc danh sách đáp án
                String[] options = {"A", "B", "C", "D"};
                String correctOption = currentRow.getCell(7).getStringCellValue(); // Cột đáp án đúng

                for (int i = 0; i < 4; i++) {
                    AnswerDto answerDto = new AnswerDto();
                    answerDto.setContent(currentRow.getCell(i + 3).getStringCellValue());
                    answerDto.setIsCorrect(options[i].equalsIgnoreCase(correctOption)); // So sánh với đáp án đúng
                    answers.add(answerDto);
                }

                questionDto.setAnswers(answers);
                questionList.add(questionDto);
            }

            workbook.close();
            return questionList;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi đọc file Excel: " + e.getMessage());
        }
    }
}
