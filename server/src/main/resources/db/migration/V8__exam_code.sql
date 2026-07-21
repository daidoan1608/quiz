ALTER TABLE exam
    ADD COLUMN exam_code VARCHAR(64) NULL;

UPDATE exam
SET exam_code = CONCAT('EXAM-', exam_id)
WHERE exam_code IS NULL OR exam_code = '';

ALTER TABLE exam
    MODIFY exam_code VARCHAR(64) NOT NULL;

SET @title_unique_index := (
    SELECT INDEX_NAME
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'exam'
      AND COLUMN_NAME = 'title'
      AND NON_UNIQUE = 0
    LIMIT 1
);

SET @drop_title_unique_sql := IF(
    @title_unique_index IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE exam DROP INDEX `', REPLACE(@title_unique_index, '`', '``'), '`')
);

PREPARE drop_title_unique_stmt FROM @drop_title_unique_sql;
EXECUTE drop_title_unique_stmt;
DEALLOCATE PREPARE drop_title_unique_stmt;

CREATE UNIQUE INDEX uk_exam_code ON exam (exam_code);
