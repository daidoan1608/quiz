package com.fita.vnua.quiz.security;

import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class InMemoryRateLimiter {
    private final Map<String, Deque<Instant>> attemptsByKey = new ConcurrentHashMap<>();
    private final Clock clock;

    public InMemoryRateLimiter() {
        this(Clock.systemUTC());
    }

    InMemoryRateLimiter(Clock clock) {
        this.clock = clock;
    }

    public boolean allow(String key, int maxAttempts, Duration window) {
        Instant now = Instant.now(clock);
        Instant threshold = now.minus(window);
        Deque<Instant> attempts = attemptsByKey.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        synchronized (attempts) {
            Iterator<Instant> iterator = attempts.iterator();
            while (iterator.hasNext()) {
                if (iterator.next().isBefore(threshold)) {
                    iterator.remove();
                }
            }
            if (attempts.size() >= maxAttempts) {
                return false;
            }
            attempts.addLast(now);
            return true;
        }
    }
}
