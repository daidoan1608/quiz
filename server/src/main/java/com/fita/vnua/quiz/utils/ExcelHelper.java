package com.fita.vnua.quiz.utils;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.AnswerDto;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.http.HttpStatus;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class ExcelHelper {

    public static List<QuestionDto> excelToQuestions(InputStream is) {
        return spreadsheetToQuestions(is);
    }

    public static List<QuestionDto> importToQuestions(InputStream is, String filename) {
        if (filename != null && filename.toLowerCase().endsWith(".csv")) {
            return csvToQuestions(is);
        }
        return spreadsheetToQuestions(is);
    }

    private static List<QuestionDto> spreadsheetToQuestions(InputStream is) {
        try (Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();
            List<QuestionDto> questionList = new ArrayList<>();

            if (rows.hasNext()) {
                rows.next();
            }

            DataFormatter formatter = new DataFormatter();
            while (rows.hasNext()) {
                questionList.add(rowToQuestion(rows.next(), formatter));
            }

            return questionList;
        } catch (CustomApiException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomApiException("Lỗi khi đọc file Excel: " + e.getMessage(), e);
        }
    }

    private static QuestionDto rowToQuestion(Row currentRow, DataFormatter formatter) {
        QuestionDto questionDto = new QuestionDto();
        List<AnswerDto> answers = new ArrayList<>();

        questionDto.setContent(getCellValue(currentRow, formatter, 0));
        String difficulty = getCellValue(currentRow, formatter, 1).trim();
        validateDifficulty(difficulty);
        questionDto.setDifficulty(difficulty);

        Set<String> correctOptions = parseCorrectOptions(getCellValue(currentRow, formatter, 6).trim().toUpperCase());
        String[] options = {"A", "B", "C", "D"};

        for (int i = 0; i < 4; i++) {
            String answerContent = getCellValue(currentRow, formatter, i + 2).trim();
            if (answerContent.isBlank()) {
                continue;
            }

            AnswerDto answerDto = new AnswerDto();
            answerDto.setContent(answerContent);
            answerDto.setIsCorrect(correctOptions.contains(options[i]));
            answers.add(answerDto);
        }

        String imageUrl = getCellValue(currentRow, formatter, 7).trim();
        String questionType = getCellValue(currentRow, formatter, 8).trim().toUpperCase();
        questionDto.setImageUrl(imageUrl.isBlank() ? null : imageUrl);
        questionDto.setQuestionType(questionType.isBlank() ? "SINGLE_CHOICE" : questionType);
        questionDto.setAnswers(answers);
        return questionDto;
    }

    private static String getCellValue(Row row, DataFormatter formatter, int index) {
        Cell cell = row.getCell(index, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        return cell != null ? formatter.formatCellValue(cell) : "";
    }

    private static List<QuestionDto> csvToQuestions(InputStream is) {
        try {
            List<List<String>> rows = parseCsv(is);
            List<QuestionDto> questionList = new ArrayList<>();

            for (int rowIndex = 1; rowIndex < rows.size(); rowIndex++) {
                List<String> row = rows.get(rowIndex);
                if (row.stream().allMatch(value -> value == null || value.isBlank())) {
                    continue;
                }
                questionList.add(rowToQuestion(row));
            }

            return questionList;
        } catch (CustomApiException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomApiException("Lỗi khi đọc file CSV: " + e.getMessage(), e);
        }
    }

    private static QuestionDto rowToQuestion(List<String> row) {
        QuestionDto questionDto = new QuestionDto();
        List<AnswerDto> answers = new ArrayList<>();
        String difficulty = getCsvValue(row, 1).trim();
        validateDifficulty(difficulty);

        Set<String> correctOptions = parseCorrectOptions(getCsvValue(row, 6).trim().toUpperCase());
        String[] options = {"A", "B", "C", "D"};

        questionDto.setContent(getCsvValue(row, 0));
        questionDto.setDifficulty(difficulty);

        for (int i = 0; i < 4; i++) {
            String answerContent = getCsvValue(row, i + 2).trim();
            if (answerContent.isBlank()) {
                continue;
            }

            AnswerDto answerDto = new AnswerDto();
            answerDto.setContent(answerContent);
            answerDto.setIsCorrect(correctOptions.contains(options[i]));
            answers.add(answerDto);
        }

        String imageUrl = getCsvValue(row, 7).trim();
        String questionType = getCsvValue(row, 8).trim().toUpperCase();
        questionDto.setImageUrl(imageUrl.isBlank() ? null : imageUrl);
        questionDto.setQuestionType(questionType.isBlank() ? "SINGLE_CHOICE" : questionType);
        questionDto.setAnswers(answers);
        return questionDto;
    }

    private static String getCsvValue(List<String> row, int index) {
        return index < row.size() && row.get(index) != null ? row.get(index) : "";
    }

    private static List<List<String>> parseCsv(InputStream is) throws IOException {
        List<List<String>> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            List<String> row = new ArrayList<>();
            StringBuilder value = new StringBuilder();
            boolean quoted = false;
            int current;

            while ((current = reader.read()) != -1) {
                char ch = (char) current;
                if (ch == '"') {
                    reader.mark(1);
                    int next = reader.read();
                    if (quoted && next == '"') {
                        value.append('"');
                    } else {
                        quoted = !quoted;
                        if (next != -1) {
                            reader.reset();
                        }
                    }
                    continue;
                }
                if (ch == ',' && !quoted) {
                    row.add(value.toString());
                    value.setLength(0);
                    continue;
                }
                if ((ch == '\n' || ch == '\r') && !quoted) {
                    if (ch == '\r') {
                        reader.mark(1);
                        int next = reader.read();
                        if (next != '\n' && next != -1) {
                            reader.reset();
                        }
                    }
                    row.add(value.toString());
                    rows.add(row);
                    row = new ArrayList<>();
                    value.setLength(0);
                    continue;
                }
                value.append(ch);
            }

            row.add(value.toString());
            rows.add(row);
        }
        return rows;
    }

    private static void validateDifficulty(String difficulty) {
        if (!difficulty.equalsIgnoreCase("EASY")
                && !difficulty.equalsIgnoreCase("MEDIUM")
                && !difficulty.equalsIgnoreCase("HARD")) {
            throw new CustomApiException("Độ khó không hợp lệ: " + difficulty, HttpStatus.BAD_REQUEST);
        }
    }

    private static Set<String> parseCorrectOptions(String correctOption) {
        return correctOption.chars()
                .mapToObj(value -> String.valueOf((char) value))
                .filter(value -> value.matches("[A-D]"))
                .collect(Collectors.toSet());
    }
}
