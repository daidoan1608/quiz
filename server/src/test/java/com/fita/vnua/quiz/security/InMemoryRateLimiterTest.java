package com.fita.vnua.quiz.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;

class InMemoryRateLimiterTest {

    private MutableClock clock;
    private InMemoryRateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        clock = new MutableClock(Instant.parse("2026-09-12T10:00:00Z"));
        rateLimiter = new InMemoryRateLimiter(clock);
    }

    @Test
    @DisplayName("Cho phép các request khi chưa vượt quá số lần tối đa trong window")
    void allow_withinLimit_returnsTrue() {
        Duration window = Duration.ofMinutes(1);
        int maxAttempts = 3;
        String key = "test-key";

        assertThat(rateLimiter.allow(key, maxAttempts, window)).isTrue();
        assertThat(rateLimiter.allow(key, maxAttempts, window)).isTrue();
        assertThat(rateLimiter.allow(key, maxAttempts, window)).isTrue();
    }

    @Test
    @DisplayName("Từ chối request khi số lần vượt quá ngưỡng maxAttempts")
    void allow_exceedsLimit_returnsFalse() {
        Duration window = Duration.ofMinutes(1);
        int maxAttempts = 2;
        String key = "test-key";

        assertThat(rateLimiter.allow(key, maxAttempts, window)).isTrue();
        assertThat(rateLimiter.allow(key, maxAttempts, window)).isTrue();
        assertThat(rateLimiter.allow(key, maxAttempts, window)).isFalse();
    }

    @Test
    @DisplayName("Cho phép lại request sau khi khoảng thời gian window kết thúc")
    void allow_afterWindowPasses_returnsTrue() {
        Duration window = Duration.ofSeconds(30);
        int maxAttempts = 1;
        String key = "test-key";

        assertThat(rateLimiter.allow(key, maxAttempts, window)).isTrue();
        assertThat(rateLimiter.allow(key, maxAttempts, window)).isFalse();

        // Tiến thời gian lên 31 giây (vượt qua window 30s)
        clock.advance(Duration.ofSeconds(31));

        assertThat(rateLimiter.allow(key, maxAttempts, window)).isTrue();
    }

    @Test
    @DisplayName("Các key khác nhau không làm ảnh hưởng đến hạn mức của nhau")
    void allow_differentKeys_isolatedLimits() {
        Duration window = Duration.ofMinutes(1);
        int maxAttempts = 1;

        assertThat(rateLimiter.allow("key-user-1", maxAttempts, window)).isTrue();
        assertThat(rateLimiter.allow("key-user-1", maxAttempts, window)).isFalse();

        // Key khác vẫn phải được phép
        assertThat(rateLimiter.allow("key-user-2", maxAttempts, window)).isTrue();
    }

    private static class MutableClock extends Clock {
        private Instant currentInstant;
        private final ZoneId zone = ZoneId.of("UTC");

        MutableClock(Instant initialInstant) {
            this.currentInstant = initialInstant;
        }

        void advance(Duration duration) {
            this.currentInstant = this.currentInstant.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return zone;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return currentInstant;
        }
    }
}