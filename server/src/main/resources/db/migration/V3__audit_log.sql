CREATE TABLE audit_log (
    audit_log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(32) NOT NULL,
    entity_type VARCHAR(32) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    actor_id BINARY(16) NULL,
    actor_username VARCHAR(255) NULL,
    description TEXT NULL,
    created_at DATETIME NOT NULL
);

CREATE INDEX idx_audit_log_created_at ON audit_log (created_at);
CREATE INDEX idx_audit_log_entity ON audit_log (entity_type, entity_id);
