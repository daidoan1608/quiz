package com.fita.vnua.quiz.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.Cache;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.lang.reflect.Method;
import java.time.Duration;
import java.util.Arrays;
import java.util.stream.Collectors;

@Configuration
public class RedisCacheConfig {

    @Bean
    public RedisCacheConfiguration cacheConfiguration(
            @Value("${app.cache.redis.key-prefix:quiz}") String keyPrefix
    ) {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(5))
                .disableCachingNullValues()
                .prefixCacheNameWith(keyPrefix + ":")
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonRedisSerializer()));
    }

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer(
            @Value("${app.cache.redis.key-prefix:quiz}") String keyPrefix
    ) {
        return builder -> builder
                .withCacheConfiguration("publicCategories", cacheWithTtl(Duration.ofMinutes(30), keyPrefix))
                .withCacheConfiguration("publicSubjectsByCategory", cacheWithTtl(Duration.ofMinutes(30), keyPrefix))
                .withCacheConfiguration("publicSubjectDetail", cacheWithTtl(Duration.ofMinutes(15), keyPrefix))
                .withCacheConfiguration("publicChaptersBySubject", cacheWithTtl(Duration.ofMinutes(30), keyPrefix))
                .withCacheConfiguration("publicExamsBySubject", cacheWithTtl(Duration.ofMinutes(10), keyPrefix))
                .withCacheConfiguration("publicExamDetail", cacheWithTtl(Duration.ofMinutes(10), keyPrefix))
                .withCacheConfiguration("practiceQuestions", cacheWithTtl(Duration.ofMinutes(5), keyPrefix))
                .withCacheConfiguration("ranking", cacheWithTtl(Duration.ofSeconds(60), keyPrefix))
                .withCacheConfiguration("notificationUnreadCount", cacheWithTtl(Duration.ofSeconds(60), keyPrefix));
    }

    @Bean("cacheKeyGenerator")
    public KeyGenerator cacheKeyGenerator() {
        return (Object target, Method method, Object... params) -> Arrays.stream(params)
                .map(param -> param == null ? "null" : param.toString())
                .collect(Collectors.joining(":"));
    }

    @Bean
    public CacheErrorHandler cacheErrorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                // Keep APIs available even when Redis is temporarily unavailable.
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                // Keep APIs available even when Redis is temporarily unavailable.
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                // Keep APIs available even when Redis is temporarily unavailable.
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                // Keep APIs available even when Redis is temporarily unavailable.
            }
        };
    }

    private RedisCacheConfiguration cacheWithTtl(Duration ttl, String keyPrefix) {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(ttl)
                .disableCachingNullValues()
                .prefixCacheNameWith(keyPrefix + ":")
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonRedisSerializer()));
    }

    private GenericJackson2JsonRedisSerializer jsonRedisSerializer() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return new GenericJackson2JsonRedisSerializer(objectMapper);
    }
}
