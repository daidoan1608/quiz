package com.fita.vnua.quiz.queue.consumer;

import com.fita.vnua.quiz.config.RabbitMqConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DeadLetterQueueConsumer {

    @RabbitListener(queues = RabbitMqConfig.DEAD_LETTER_QUEUE)
    public void handleDeadLetterMessage(Message message) {
        String failedMessageBody = new String(message.getBody());
        log.warn("[RabbitMQ DLQ] Received failed message in Dead Letter Queue: {}", failedMessageBody);
    }
}
