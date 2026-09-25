package com.fita.vnua.quiz.queue;

import com.fita.vnua.quiz.model.dto.queue.ExamSubmissionMessage;
import com.fita.vnua.quiz.queue.consumer.ExamSubmissionConsumer;
import com.fita.vnua.quiz.service.UserExamService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ExamSubmissionConsumerTest {

    @Mock
    private UserExamService userExamService;

    private ExamSubmissionConsumer consumer;

    @BeforeEach
    void setUp() {
        consumer = new ExamSubmissionConsumer(userExamService);
    }

    @Test
    void handleExamSubmission_ShouldDelegateToUserExamService() {
        UUID userId = UUID.randomUUID();
        ExamSubmissionMessage message = ExamSubmissionMessage.builder()
                .userExamId(101L)
                .userId(userId)
                .submittedAt(LocalDateTime.now())
                .build();

        consumer.handleExamSubmission(message);

        verify(userExamService).submitAttempt(101L, userId);
    }
}
