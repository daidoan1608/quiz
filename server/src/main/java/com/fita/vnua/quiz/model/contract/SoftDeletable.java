package com.fita.vnua.quiz.model.contract;

import java.time.LocalDateTime;
import java.util.UUID;

public interface SoftDeletable {
    Boolean getDeleted();

    void setDeleted(Boolean deleted);

    void setDeletedAt(LocalDateTime deletedAt);

    void setDeletedBy(UUID deletedBy);

    UUID getDeletedCascadeId();

    void setDeletedCascadeId(UUID deletedCascadeId);

    void setDeleteOriginType(String deleteOriginType);

    void setDeleteOriginId(Long deleteOriginId);
}
