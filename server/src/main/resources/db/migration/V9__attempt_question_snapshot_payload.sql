ALTER TABLE user_exam_question
    ADD COLUMN question_content_snapshot TEXT NULL,
    ADD COLUMN question_image_url_snapshot VARCHAR(1000) NULL,
    ADD COLUMN question_difficulty_snapshot VARCHAR(32) NULL,
    ADD COLUMN question_type_snapshot VARCHAR(32) NULL,
    ADD COLUMN answers_snapshot_json JSON NULL;
