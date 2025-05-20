package com.fita.vnua.quiz.genaretor;

import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Embeddable
public class FavoriteId implements Serializable {
    private UUID userId;
    private Long subjectId;

    // Override equals() và hashCode() để đảm bảo hoạt động của composite key
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FavoriteId that = (FavoriteId) o;
        return userId.equals(that.userId) &&
                subjectId.equals(that.subjectId);
    }

    @Override
    public int hashCode() {
        return userId.hashCode() + subjectId.hashCode();
    }
}
