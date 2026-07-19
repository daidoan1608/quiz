CREATE TABLE IF NOT EXISTS admin_group (
    id BIGINT NOT NULL AUTO_INCREMENT,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    system_managed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_admin_group_code (code)
);

CREATE TABLE IF NOT EXISTS admin_group_permission (
    id BIGINT NOT NULL AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    scope_type VARCHAR(50) NOT NULL,
    scope_id BIGINT NULL,
    resource VARCHAR(80) NOT NULL,
    action VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_admin_group_permission (group_id, scope_type, scope_id, resource, action),
    CONSTRAINT fk_admin_group_permission_group
        FOREIGN KEY (group_id) REFERENCES admin_group(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_user_group (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BINARY(16) NOT NULL,
    group_id BIGINT NOT NULL,
    assigned_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_admin_user_group (user_id, group_id),
    CONSTRAINT fk_admin_user_group_group
        FOREIGN KEY (group_id) REFERENCES admin_group(id)
        ON DELETE CASCADE
);

INSERT IGNORE INTO admin_group (code, name, description, active, system_managed, created_at, updated_at)
SELECT DISTINCT
    CONCAT('DIRECT_MOD_', HEX(usp.user_id), '_SUBJECT_', usp.subject_id),
    CONCAT('Quyền trực tiếp môn ', usp.subject_id),
    'Nhóm quyền được migrate từ user_subject_permission',
    TRUE,
    TRUE,
    NOW(),
    NOW()
FROM user_subject_permission usp;

INSERT IGNORE INTO admin_user_group (user_id, group_id, assigned_at)
SELECT DISTINCT usp.user_id, ag.id, NOW()
FROM user_subject_permission usp
JOIN admin_group ag
  ON ag.code = CONCAT('DIRECT_MOD_', HEX(usp.user_id), '_SUBJECT_', usp.subject_id);

INSERT IGNORE INTO admin_group_permission (group_id, scope_type, scope_id, resource, action)
SELECT DISTINCT ag.id, 'GLOBAL', NULL, menu_resource, 'VIEW'
FROM user_subject_permission usp
JOIN admin_group ag
  ON ag.code = CONCAT('DIRECT_MOD_', HEX(usp.user_id), '_SUBJECT_', usp.subject_id)
JOIN (
    SELECT 'MENU_SUBJECTS' AS menu_resource
    UNION ALL SELECT 'MENU_CHAPTERS'
    UNION ALL SELECT 'MENU_QUESTIONS'
    UNION ALL SELECT 'MENU_EXAMS'
) menus ON 1 = 1;

INSERT IGNORE INTO admin_group_permission (group_id, scope_type, scope_id, resource, action)
SELECT DISTINCT ag.id, 'SUBJECT', usp.subject_id, resources.resource, 'VIEW'
FROM user_subject_permission usp
JOIN admin_group ag
  ON ag.code = CONCAT('DIRECT_MOD_', HEX(usp.user_id), '_SUBJECT_', usp.subject_id)
JOIN (
    SELECT 'SUBJECT' AS resource
    UNION ALL SELECT 'CHAPTER'
    UNION ALL SELECT 'QUESTION'
    UNION ALL SELECT 'EXAM'
) resources ON usp.permission_type = 'READ';

INSERT IGNORE INTO admin_group_permission (group_id, scope_type, scope_id, resource, action)
SELECT DISTINCT ag.id, 'SUBJECT', usp.subject_id, resources.resource, 'CREATE'
FROM user_subject_permission usp
JOIN admin_group ag
  ON ag.code = CONCAT('DIRECT_MOD_', HEX(usp.user_id), '_SUBJECT_', usp.subject_id)
JOIN (
    SELECT 'CHAPTER' AS resource
    UNION ALL SELECT 'QUESTION'
    UNION ALL SELECT 'EXAM'
) resources ON usp.permission_type = 'CREATE';

INSERT IGNORE INTO admin_group_permission (group_id, scope_type, scope_id, resource, action)
SELECT DISTINCT ag.id, 'SUBJECT', usp.subject_id, resources.resource, 'UPDATE'
FROM user_subject_permission usp
JOIN admin_group ag
  ON ag.code = CONCAT('DIRECT_MOD_', HEX(usp.user_id), '_SUBJECT_', usp.subject_id)
JOIN (
    SELECT 'SUBJECT' AS resource
    UNION ALL SELECT 'CHAPTER'
    UNION ALL SELECT 'QUESTION'
    UNION ALL SELECT 'EXAM'
) resources ON usp.permission_type = 'UPDATE';

INSERT IGNORE INTO admin_group_permission (group_id, scope_type, scope_id, resource, action)
SELECT DISTINCT ag.id, 'SUBJECT', usp.subject_id, resources.resource, 'DELETE'
FROM user_subject_permission usp
JOIN admin_group ag
  ON ag.code = CONCAT('DIRECT_MOD_', HEX(usp.user_id), '_SUBJECT_', usp.subject_id)
JOIN (
    SELECT 'SUBJECT' AS resource
    UNION ALL SELECT 'CHAPTER'
    UNION ALL SELECT 'QUESTION'
    UNION ALL SELECT 'EXAM'
) resources ON usp.permission_type = 'DELETE';
