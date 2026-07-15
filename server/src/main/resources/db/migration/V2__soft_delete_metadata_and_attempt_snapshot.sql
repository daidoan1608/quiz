SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'category' AND column_name = 'deleted'),
    'SELECT 1',
    'ALTER TABLE category ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT FALSE'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'category' AND column_name = 'deleted_at'), 'SELECT 1', 'ALTER TABLE category ADD COLUMN deleted_at DATETIME(6) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'category' AND column_name = 'deleted_by'), 'SELECT 1', 'ALTER TABLE category ADD COLUMN deleted_by BINARY(16) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'category' AND column_name = 'deleted_cascade_id'), 'SELECT 1', 'ALTER TABLE category ADD COLUMN deleted_cascade_id BINARY(16) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'category' AND column_name = 'delete_origin_type'), 'SELECT 1', 'ALTER TABLE category ADD COLUMN delete_origin_type VARCHAR(50) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'category' AND column_name = 'delete_origin_id'), 'SELECT 1', 'ALTER TABLE category ADD COLUMN delete_origin_id BIGINT NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subject' AND column_name = 'deleted'), 'SELECT 1', 'ALTER TABLE subject ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT FALSE');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subject' AND column_name = 'deleted_at'), 'SELECT 1', 'ALTER TABLE subject ADD COLUMN deleted_at DATETIME(6) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subject' AND column_name = 'deleted_by'), 'SELECT 1', 'ALTER TABLE subject ADD COLUMN deleted_by BINARY(16) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subject' AND column_name = 'deleted_cascade_id'), 'SELECT 1', 'ALTER TABLE subject ADD COLUMN deleted_cascade_id BINARY(16) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subject' AND column_name = 'delete_origin_type'), 'SELECT 1', 'ALTER TABLE subject ADD COLUMN delete_origin_type VARCHAR(50) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subject' AND column_name = 'delete_origin_id'), 'SELECT 1', 'ALTER TABLE subject ADD COLUMN delete_origin_id BIGINT NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'chapter' AND column_name = 'deleted'), 'SELECT 1', 'ALTER TABLE chapter ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT FALSE');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'chapter' AND column_name = 'deleted_at'), 'SELECT 1', 'ALTER TABLE chapter ADD COLUMN deleted_at DATETIME(6) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'chapter' AND column_name = 'deleted_by'), 'SELECT 1', 'ALTER TABLE chapter ADD COLUMN deleted_by BINARY(16) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'chapter' AND column_name = 'deleted_cascade_id'), 'SELECT 1', 'ALTER TABLE chapter ADD COLUMN deleted_cascade_id BINARY(16) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'chapter' AND column_name = 'delete_origin_type'), 'SELECT 1', 'ALTER TABLE chapter ADD COLUMN delete_origin_type VARCHAR(50) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'chapter' AND column_name = 'delete_origin_id'), 'SELECT 1', 'ALTER TABLE chapter ADD COLUMN delete_origin_id BIGINT NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'exam' AND column_name = 'deleted'), 'SELECT 1', 'ALTER TABLE exam ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT FALSE');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'exam' AND column_name = 'deleted_at'), 'SELECT 1', 'ALTER TABLE exam ADD COLUMN deleted_at DATETIME(6) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'exam' AND column_name = 'deleted_by'), 'SELECT 1', 'ALTER TABLE exam ADD COLUMN deleted_by BINARY(16) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'exam' AND column_name = 'deleted_cascade_id'), 'SELECT 1', 'ALTER TABLE exam ADD COLUMN deleted_cascade_id BINARY(16) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'exam' AND column_name = 'delete_origin_type'), 'SELECT 1', 'ALTER TABLE exam ADD COLUMN delete_origin_type VARCHAR(50) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'exam' AND column_name = 'delete_origin_id'), 'SELECT 1', 'ALTER TABLE exam ADD COLUMN delete_origin_id BIGINT NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'question' AND column_name = 'deleted'), 'SELECT 1', 'ALTER TABLE question ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT FALSE');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'question' AND column_name = 'deleted_at'), 'SELECT 1', 'ALTER TABLE question ADD COLUMN deleted_at DATETIME(6) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'question' AND column_name = 'deleted_by'), 'SELECT 1', 'ALTER TABLE question ADD COLUMN deleted_by BINARY(16) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'question' AND column_name = 'deleted_cascade_id'), 'SELECT 1', 'ALTER TABLE question ADD COLUMN deleted_cascade_id BINARY(16) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'question' AND column_name = 'delete_origin_type'), 'SELECT 1', 'ALTER TABLE question ADD COLUMN delete_origin_type VARCHAR(50) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'question' AND column_name = 'delete_origin_id'), 'SELECT 1', 'ALTER TABLE question ADD COLUMN delete_origin_id BIGINT NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user' AND column_name = 'deleted'), 'SELECT 1', 'ALTER TABLE user ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT FALSE');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user' AND column_name = 'deleted_at'), 'SELECT 1', 'ALTER TABLE user ADD COLUMN deleted_at DATETIME(6) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user' AND column_name = 'deleted_by'), 'SELECT 1', 'ALTER TABLE user ADD COLUMN deleted_by BINARY(16) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user' AND column_name = 'deleted_cascade_id'), 'SELECT 1', 'ALTER TABLE user ADD COLUMN deleted_cascade_id BINARY(16) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user' AND column_name = 'delete_origin_type'), 'SELECT 1', 'ALTER TABLE user ADD COLUMN delete_origin_type VARCHAR(50) NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user' AND column_name = 'delete_origin_id'), 'SELECT 1', 'ALTER TABLE user ADD COLUMN delete_origin_id BIGINT NULL');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS user_exam_question (
    user_exam_question_id BIGINT NOT NULL AUTO_INCREMENT,
    user_exam_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    position INT NOT NULL,
    PRIMARY KEY (user_exam_question_id),
    CONSTRAINT fk_user_exam_question_user_exam FOREIGN KEY (user_exam_id) REFERENCES user_exam(user_exam_id),
    CONSTRAINT fk_user_exam_question_question FOREIGN KEY (question_id) REFERENCES question(question_id),
    CONSTRAINT uq_user_exam_question UNIQUE (user_exam_id, question_id)
);

SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'category' AND index_name = 'idx_category_deleted'), 'SELECT 1', 'CREATE INDEX idx_category_deleted ON category (deleted)');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'subject' AND index_name = 'idx_subject_deleted'), 'SELECT 1', 'CREATE INDEX idx_subject_deleted ON subject (deleted)');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'chapter' AND index_name = 'idx_chapter_deleted'), 'SELECT 1', 'CREATE INDEX idx_chapter_deleted ON chapter (deleted)');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'exam' AND index_name = 'idx_exam_deleted'), 'SELECT 1', 'CREATE INDEX idx_exam_deleted ON exam (deleted)');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'question' AND index_name = 'idx_question_deleted'), 'SELECT 1', 'CREATE INDEX idx_question_deleted ON question (deleted)');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user' AND index_name = 'idx_user_deleted'), 'SELECT 1', 'CREATE INDEX idx_user_deleted ON user (deleted)');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
