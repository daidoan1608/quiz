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
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class ExcelHelper {
    private static final int MIN_ANSWERS = 2;
    private static final int MAX_ANSWERS = 8;
    private static final String[] OPTIONS = {"A", "B", "C", "D", "E", "F", "G", "H"};

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
            DataFormatter formatter = new DataFormatter();

            ImportColumns columns = ImportColumns.current();
            if (rows.hasNext()) {
                columns = ImportColumns.fromHeader(rows.next(), formatter);
            }

            while (rows.hasNext()) {
                Row row = rows.next();
                if (isBlankRow(row, formatter, columns)) {
                    continue;
                }
                questionList.add(rowToQuestion(row, formatter, columns));
            }

            return questionList;
        } catch (CustomApiException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomApiException("Lỗi khi đọc file Excel: " + e.getMessage(), e);
        }
    }

    private static QuestionDto rowToQuestion(Row currentRow, DataFormatter formatter, ImportColumns columns) {
        QuestionDto questionDto = new QuestionDto();
        List<AnswerDto> answers = new ArrayList<>();

        questionDto.setContent(getCellValue(currentRow, formatter, 0));
        String difficulty = getCellValue(currentRow, formatter, 1).trim();
        validateDifficulty(difficulty);
        questionDto.setDifficulty(difficulty);

        Set<String> correctOptions = parseCorrectOptions(getCellValue(currentRow, formatter, columns.correctOptionsColumn()).trim().toUpperCase());
        boolean hasBlankAnswerBeforeFilledAnswer = false;
        boolean seenBlankAnswer = false;

        for (int i = 0; i < columns.answerLimit(); i++) {
            String answerContent = getCellValue(currentRow, formatter, i + 2).trim();
            if (answerContent.isBlank()) {
                seenBlankAnswer = true;
                continue;
            }
            if (seenBlankAnswer) {
                hasBlankAnswerBeforeFilledAnswer = true;
            }

            AnswerDto answerDto = new AnswerDto();
            answerDto.setContent(answerContent);
            answerDto.setIsCorrect(correctOptions.contains(OPTIONS[i]));
            answers.add(answerDto);
        }
        if (hasBlankAnswerBeforeFilledAnswer) {
            throw new CustomApiException("Các đáp án phải nhập liền từ A, không được bỏ trống đáp án ở giữa.", HttpStatus.BAD_REQUEST);
        }
        validateCorrectOptionsWithinAnswerRange(correctOptions, answers.size());

        String imageUrl = getCellValue(currentRow, formatter, columns.imageUrlColumn()).trim();
        String questionType = getCellValue(currentRow, formatter, columns.questionTypeColumn()).trim().toUpperCase();
        questionDto.setImageUrl(imageUrl.isBlank() ? null : imageUrl);
        questionDto.setQuestionType(questionType.isBlank() ? "SINGLE_CHOICE" : questionType);
        questionDto.setAnswers(answers);
        return questionDto;
    }

    private static String getCellValue(Row row, DataFormatter formatter, int index) {
        Cell cell = row.getCell(index, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        return cell != null ? formatter.formatCellValue(cell) : "";
    }

    private static boolean isBlankRow(Row row, DataFormatter formatter, ImportColumns columns) {
        for (int index = 0; index <= columns.questionTypeColumn(); index++) {
            if (!getCellValue(row, formatter, index).trim().isBlank()) {
                return false;
            }
        }
        return true;
    }

    private static List<QuestionDto> csvToQuestions(InputStream is) {
        try {
            List<List<String>> rows = parseCsv(is);
            List<QuestionDto> questionList = new ArrayList<>();
            ImportColumns columns = rows.isEmpty()
                    ? ImportColumns.current()
                    : ImportColumns.fromHeader(rows.get(0));

            for (int rowIndex = 1; rowIndex < rows.size(); rowIndex++) {
                List<String> row = rows.get(rowIndex);
                if (row.stream().allMatch(value -> value == null || value.isBlank())) {
                    continue;
                }
                questionList.add(rowToQuestion(row, columns));
            }

            return questionList;
        } catch (CustomApiException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomApiException("Lỗi khi đọc file CSV: " + e.getMessage(), e);
        }
    }

    private static QuestionDto rowToQuestion(List<String> row, ImportColumns columns) {
        QuestionDto questionDto = new QuestionDto();
        List<AnswerDto> answers = new ArrayList<>();
        String difficulty = getCsvValue(row, 1).trim();
        validateDifficulty(difficulty);

        Set<String> correctOptions = parseCorrectOptions(getCsvValue(row, columns.correctOptionsColumn()).trim().toUpperCase());
        boolean hasBlankAnswerBeforeFilledAnswer = false;
        boolean seenBlankAnswer = false;

        questionDto.setContent(getCsvValue(row, 0));
        questionDto.setDifficulty(difficulty);

        for (int i = 0; i < columns.answerLimit(); i++) {
            String answerContent = getCsvValue(row, i + 2).trim();
            if (answerContent.isBlank()) {
                seenBlankAnswer = true;
                continue;
            }
            if (seenBlankAnswer) {
                hasBlankAnswerBeforeFilledAnswer = true;
            }

            AnswerDto answerDto = new AnswerDto();
            answerDto.setContent(answerContent);
            answerDto.setIsCorrect(correctOptions.contains(OPTIONS[i]));
            answers.add(answerDto);
        }
        if (hasBlankAnswerBeforeFilledAnswer) {
            throw new CustomApiException("Các đáp án phải nhập liền từ A, không được bỏ trống đáp án ở giữa.", HttpStatus.BAD_REQUEST);
        }
        validateCorrectOptionsWithinAnswerRange(correctOptions, answers.size());

        String imageUrl = getCsvValue(row, columns.imageUrlColumn()).trim();
        String questionType = getCsvValue(row, columns.questionTypeColumn()).trim().toUpperCase();
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

    private static void validateCorrectOptionsWithinAnswerRange(Set<String> correctOptions, int answerCount) {
        for (String option : correctOptions) {
            int optionIndex = option.charAt(0) - 'A';
            if (optionIndex >= answerCount) {
                throw new CustomApiException("Đáp án đúng " + option + " không có nội dung đáp án tương ứng.", HttpStatus.BAD_REQUEST);
            }
        }
    }

    private static Set<String> parseCorrectOptions(String correctOption) {
        return correctOption.chars()
                .mapToObj(value -> String.valueOf((char) value))
                .filter(value -> value.matches("[A-H]"))
                .collect(Collectors.toSet());
    }

    private record ImportColumns(int correctOptionsColumn, int imageUrlColumn, int questionTypeColumn) {
        static ImportColumns current() {
            return new ImportColumns(10, 11, 12);
        }

        static ImportColumns legacy() {
            return new ImportColumns(6, 7, 8);
        }

        static ImportColumns fromHeader(Row header, DataFormatter formatter) {
            for (int index = 0; index <= 12; index++) {
                if (isCorrectAnswerHeader(getCellValue(header, formatter, index))) {
                    return fromCorrectColumn(index);
                }
            }
            return current();
        }

        static ImportColumns fromHeader(List<String> header) {
            for (int index = 0; index < header.size() && index <= 12; index++) {
                if (isCorrectAnswerHeader(getCsvValue(header, index))) {
                    return fromCorrectColumn(index);
                }
            }
            return current();
        }

        private static ImportColumns fromCorrectColumn(int correctColumn) {
            if (correctColumn <= legacy().correctOptionsColumn()) {
                return legacy();
            }
            return new ImportColumns(correctColumn, correctColumn + 1, correctColumn + 2);
        }

        int answerLimit() {
            return Math.min(MAX_ANSWERS, Math.max(MIN_ANSWERS, correctOptionsColumn - 2));
        }

        private static boolean isCorrectAnswerHeader(String value) {
            String normalized = Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
                    .replaceAll("\\p{M}", "")
                    .toLowerCase()
                    .replaceAll("[^a-z]", "");
            return normalized.equals("dapandung");
        }
    }
}
