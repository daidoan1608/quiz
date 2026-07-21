ALTER TABLE question
    ADD COLUMN exam_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN practice_enabled BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE question
SET exam_enabled = TRUE,
    practice_enabled = TRUE
WHERE exam_enabled IS NULL
   OR practice_enabled IS NULL;
