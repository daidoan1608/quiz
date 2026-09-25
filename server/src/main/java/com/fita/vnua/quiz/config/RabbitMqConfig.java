package com.fita.vnua.quiz.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMqConfig {

    // Main Exchange
    public static final String QUIZ_EXCHANGE = "quiz.exchange";

    // Dead Letter Exchange & Queue
    public static final String QUIZ_DLX = "quiz.dlx";
    public static final String DEAD_LETTER_QUEUE = "quiz.dead-letter.queue";
    public static final String DLQ_ROUTING_KEY_PATTERN = "quiz.dlq.#";

    // Queues & Routing Keys
    public static final String EXAM_SUBMISSION_QUEUE = "exam.submission.queue";
    public static final String EXAM_SUBMISSION_ROUTING_KEY = "exam.submission";

    public static final String AI_GENERATION_QUEUE = "ai.generation.queue";
    public static final String AI_GENERATION_ROUTING_KEY = "ai.generation";

    public static final String NOTIFICATION_EMAIL_QUEUE = "notification.email.queue";
    public static final String NOTIFICATION_EMAIL_ROUTING_KEY = "notification.email";

    @Bean
    public TopicExchange quizExchange() {
        return new TopicExchange(QUIZ_EXCHANGE, true, false);
    }

    @Bean
    public TopicExchange quizDeadLetterExchange() {
        return new TopicExchange(QUIZ_DLX, true, false);
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DEAD_LETTER_QUEUE).build();
    }

    @Bean
    public Binding deadLetterBinding(Queue deadLetterQueue, TopicExchange quizDeadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue).to(quizDeadLetterExchange).with(DLQ_ROUTING_KEY_PATTERN);
    }

    @Bean
    public Queue examSubmissionQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", QUIZ_DLX);
        args.put("x-dead-letter-routing-key", "quiz.dlq.exam");
        return QueueBuilder.durable(EXAM_SUBMISSION_QUEUE).withArguments(args).build();
    }

    @Bean
    public Binding examSubmissionBinding(Queue examSubmissionQueue, TopicExchange quizExchange) {
        return BindingBuilder.bind(examSubmissionQueue).to(quizExchange).with(EXAM_SUBMISSION_ROUTING_KEY);
    }

    @Bean
    public Queue aiGenerationQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", QUIZ_DLX);
        args.put("x-dead-letter-routing-key", "quiz.dlq.ai");
        return QueueBuilder.durable(AI_GENERATION_QUEUE).withArguments(args).build();
    }

    @Bean
    public Binding aiGenerationBinding(Queue aiGenerationQueue, TopicExchange quizExchange) {
        return BindingBuilder.bind(aiGenerationQueue).to(quizExchange).with(AI_GENERATION_ROUTING_KEY);
    }

    @Bean
    public Queue notificationEmailQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", QUIZ_DLX);
        args.put("x-dead-letter-routing-key", "quiz.dlq.email");
        return QueueBuilder.durable(NOTIFICATION_EMAIL_QUEUE).withArguments(args).build();
    }

    @Bean
    public Binding notificationEmailBinding(Queue notificationEmailQueue, TopicExchange quizExchange) {
        return BindingBuilder.bind(notificationEmailQueue).to(quizExchange).with(NOTIFICATION_EMAIL_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}
