package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.ai.GenerateQuestionsResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.model.enums.QuestionDifficulty;
import org.springframework.web.multipart.MultipartFile;

public interface AiQuestionGeneratorService {
    GenerateQuestionsResponse generateQuestionsFromFile(
            MultipartFile file,
            Long chapterId,
            Integer numberOfQuestions,
            QuestionDifficulty difficulty,
            Boolean saveToDatabase,
            User currentUser
    );

    GenerateQuestionsResponse generateQuestionsFromText(
            String documentText,
            String sourceName,
            Long chapterId,
            Integer numberOfQuestions,
            QuestionDifficulty difficulty,
            Boolean saveToDatabase,
            User currentUser
    );
}
