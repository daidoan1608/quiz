package com.fita.vnua.quiz.model.dto;// package com.fita.vnua.quiz.model.dto;
// (Tạo package và file phù hợp)

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class PermissionAssignmentDTO {

    // ID của người dùng (Mod) được phân quyền
    private UUID modUserId;

    // ID của môn học (Subject) được phân quyền
    private Long subjectId;

    // Danh sách các quyền được gán (Ví dụ: ["UPDATE", "DELETE"])
    private List<String> permissions;
}