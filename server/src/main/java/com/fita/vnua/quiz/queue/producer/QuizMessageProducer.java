package com.fita.vnua.quiz.queue.producer;

import com.fita.vnua.quiz.config.RabbitMqConfig;
import com.fita.vnua.quiz.model.dto.queue.AiGenerationMessage;
import com.fita.vnua.quiz.model.dto.queue.EmailNotificationMessage;
import com.fita.vnua.quiz.model.dto.queue.ExamSubmissionMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizMessageProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendExamSubmission(ExamSubmissionMessage message) {
        log.info("[RabbitMQ] Publishing exam submission message for userExamId: {}", message.getUserExamId());
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.QUIZ_EXCHANGE,
                RabbitMqConfig.EXAM_SUBMISSION_ROUTING_KEY,
                message
        );
    }

    public void sendAiGenerationJob(AiGenerationMessage message) {
        log.info("[RabbitMQ] Publishing AI generation job message with jobId: {}", message.getJobId());
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.QUIZ_EXCHANGE,
                RabbitMqConfig.AI_GENERATION_ROUTING_KEY,
                message
        );
    }

    public void sendEmailNotification(EmailNotificationMessage message) {
        log.info("[RabbitMQ] Publishing email notification message to: {}", message.getTo());
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.QUIZ_EXCHANGE,
                RabbitMqConfig.NOTIFICATION_EMAIL_ROUTING_KEY,
                message
        );
    }
}
