package com.fita.vnua.quiz.queue.consumer;

import com.fita.vnua.quiz.config.RabbitMqConfig;
import com.fita.vnua.quiz.model.dto.queue.ExamSubmissionMessage;
import com.fita.vnua.quiz.service.UserExamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExamSubmissionConsumer {

    private final UserExamService userExamService;

    @RabbitListener(queues = RabbitMqConfig.EXAM_SUBMISSION_QUEUE)
    public void handleExamSubmission(ExamSubmissionMessage message) {
        log.info("[RabbitMQ] Received exam submission for userExamId: {}, userId: {}",
                message.getUserExamId(), message.getUserId());
        try {
            userExamService.submitAttempt(message.getUserExamId(), message.getUserId());
            log.info("[RabbitMQ] Successfully processed and graded userExamId: {}", message.getUserExamId());
        } catch (Exception e) {
            log.error("[RabbitMQ] Error grading exam attempt userExamId: {}: {}",
                    message.getUserExamId(), e.getMessage(), e);
            throw e;
        }
    }
}
