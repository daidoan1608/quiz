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

import java.util.concurrent.atomic.AtomicLong;

@Component
public class InMemoryRateLimiter {
    private static final int MAX_ENTRIES = 10_000;
    private final Map<String, Deque<Instant>> attemptsByKey = new ConcurrentHashMap<>();
    private final Clock clock;
    private final AtomicLong accessCounter = new AtomicLong();

    public InMemoryRateLimiter() {
        this(Clock.systemUTC());
    }

    InMemoryRateLimiter(Clock clock) {
        this.clock = clock;
    }

    public boolean allow(String key, int maxAttempts, Duration window) {
        if (accessCounter.incrementAndGet() % 500 == 0 || attemptsByKey.size() > MAX_ENTRIES) {
            pruneExpiredKeys(window);
        }

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

    private void pruneExpiredKeys(Duration window) {
        Instant now = Instant.now(clock);
        Instant threshold = now.minus(window.multipliedBy(2));
        attemptsByKey.entrySet().removeIf(entry -> {
            Deque<Instant> attempts = entry.getValue();
            synchronized (attempts) {
                while (!attempts.isEmpty() && attempts.peekFirst().isBefore(threshold)) {
                    attempts.pollFirst();
                }
                return attempts.isEmpty();
            }
        });
    }
}
