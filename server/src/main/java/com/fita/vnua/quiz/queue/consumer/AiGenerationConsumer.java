package com.fita.vnua.quiz.queue.consumer;

import com.fita.vnua.quiz.config.RabbitMqConfig;
import com.fita.vnua.quiz.model.dto.ai.GenerateQuestionsResponse;
import com.fita.vnua.quiz.model.dto.queue.AiGenerationMessage;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.model.enums.QuestionDifficulty;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.service.AiQuestionGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiGenerationConsumer {

    private final AiQuestionGeneratorService aiQuestionGeneratorService;
    private final UserRepository userRepository;

    @RabbitListener(queues = RabbitMqConfig.AI_GENERATION_QUEUE)
    public void handleAiGenerationJob(AiGenerationMessage message) {
        log.info("[RabbitMQ] Received AI generation job: {} for user: {}",
                message.getJobId(), message.getUserId());
        try {
            User user = userRepository.findById(message.getUserId()).orElse(null);
            QuestionDifficulty difficulty = null;
            if (message.getDifficulty() != null) {
                try {
                    difficulty = QuestionDifficulty.valueOf(message.getDifficulty().toUpperCase());
                } catch (IllegalArgumentException ignored) {
                }
            }

            GenerateQuestionsResponse response = aiQuestionGeneratorService.generateQuestionsFromText(
                    message.getExtractedText(),
                    message.getOriginalFileName(),
                    message.getChapterId(),
                    message.getNumberOfQuestions(),
                    difficulty,
                    message.getSaveToDatabase(),
                    user
            );
            log.info("[RabbitMQ] AI generation completed for job {}. Generated {} questions.",
                    message.getJobId(),
                    response != null && response.getQuestions() != null ? response.getQuestions().size() : 0);
        } catch (Exception e) {
            log.error("[RabbitMQ] Error processing AI generation job {}: {}",
                    message.getJobId(), e.getMessage(), e);
            throw e;
        }
    }
}
