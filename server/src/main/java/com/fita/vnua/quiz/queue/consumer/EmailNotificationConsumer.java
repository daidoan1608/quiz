package com.fita.vnua.quiz.queue.consumer;

import com.fita.vnua.quiz.config.RabbitMqConfig;
import com.fita.vnua.quiz.model.dto.queue.EmailNotificationMessage;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailNotificationConsumer {

    private final JavaMailSender mailSender;

    @RabbitListener(queues = RabbitMqConfig.NOTIFICATION_EMAIL_QUEUE)
    public void handleEmailNotification(EmailNotificationMessage message) {
        log.info("[RabbitMQ] Processing email dispatch to: {}", message.getTo());
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(message.getTo());
            helper.setSubject(message.getSubject());
            helper.setText(message.getContent(), message.isHtml());
            mailSender.send(mimeMessage);
            log.info("[RabbitMQ] Email sent successfully to: {}", message.getTo());
        } catch (MessagingException e) {
            log.error("[RabbitMQ] Failed to send email to {}: {}", message.getTo(), e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }
}
