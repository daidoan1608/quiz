CREATE TABLE IF NOT EXISTS shared_documents (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(150) NULL,
    file_size BIGINT NOT NULL,
    active BIT(1) NOT NULL DEFAULT b'1',
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id)
);

CREATE INDEX idx_shared_documents_active_created_at
    ON shared_documents (active, created_at);
