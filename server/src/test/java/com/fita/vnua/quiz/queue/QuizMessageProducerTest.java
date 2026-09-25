package com.fita.vnua.quiz.queue;

import com.fita.vnua.quiz.config.RabbitMqConfig;
import com.fita.vnua.quiz.model.dto.queue.AiGenerationMessage;
import com.fita.vnua.quiz.model.dto.queue.EmailNotificationMessage;
import com.fita.vnua.quiz.model.dto.queue.ExamSubmissionMessage;
import com.fita.vnua.quiz.queue.producer.QuizMessageProducer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class QuizMessageProducerTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    private QuizMessageProducer producer;

    @BeforeEach
    void setUp() {
        producer = new QuizMessageProducer(rabbitTemplate);
    }

    @Test
    void sendExamSubmission_ShouldPublishToExchange() {
        ExamSubmissionMessage message = ExamSubmissionMessage.builder()
                .userExamId(100L)
                .userId(UUID.randomUUID())
                .submittedAt(LocalDateTime.now())
                .build();

        producer.sendExamSubmission(message);

        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMqConfig.QUIZ_EXCHANGE),
                eq(RabbitMqConfig.EXAM_SUBMISSION_ROUTING_KEY),
                eq(message)
        );
    }

    @Test
    void sendAiGenerationJob_ShouldPublishToExchange() {
        AiGenerationMessage message = AiGenerationMessage.builder()
                .jobId("job-123")
                .userId(UUID.randomUUID())
                .chapterId(1L)
                .numberOfQuestions(5)
                .difficulty("MEDIUM")
                .extractedText("Sample test content")
                .build();

        producer.sendAiGenerationJob(message);

        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMqConfig.QUIZ_EXCHANGE),
                eq(RabbitMqConfig.AI_GENERATION_ROUTING_KEY),
                eq(message)
        );
    }

    @Test
    void sendEmailNotification_ShouldPublishToExchange() {
        EmailNotificationMessage message = EmailNotificationMessage.builder()
                .to("student@example.com")
                .subject("Ket qua thi")
                .content("<p>Diem: 9.5</p>")
                .isHtml(true)
                .build();

        producer.sendEmailNotification(message);

        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMqConfig.QUIZ_EXCHANGE),
                eq(RabbitMqConfig.NOTIFICATION_EMAIL_ROUTING_KEY),
                eq(message)
        );
    }
}
