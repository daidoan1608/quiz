export const ACTION_LABELS = {
  VIEW: "Xem",
  CREATE: "Thêm",
  UPDATE: "Sửa",
  DELETE: "Xóa",
  RESTORE: "Khôi phục",
  IMPORT: "Import",
  EXPORT: "Export",
  SEND: "Gửi",
  VIEW_RECIPIENTS: "Xem người nhận",
  RECALL: "Thu hồi",
};

export const RESOURCE_LABELS = {
  MENU_DASHBOARD: "Menu dashboard",
  MENU_SUBJECTS: "Menu môn học",
  MENU_CHAPTERS: "Menu chương",
  MENU_QUESTIONS: "Menu câu hỏi",
  MENU_EXAMS: "Menu đề thi",
  MENU_NOTIFICATIONS: "Menu thông báo",
  MENU_DOCUMENTS: "Menu tài liệu",
  MENU_USER_EXAMS: "Menu kết quả thi",
  MENU_USERS: "Menu người dùng",
  MENU_GROUPS: "Menu nhóm quyền",
  MENU_CATEGORIES: "Menu khoa",
  MENU_AUDIT_LOGS: "Menu audit log",
  SUBJECT: "Môn học",
  CHAPTER: "Chương",
  QUESTION: "Câu hỏi",
  EXAM: "Đề thi",
  NOTIFICATION: "Thông báo",
  STATISTIC: "Thống kê",
  USER_EXAM: "Kết quả thi",
  DOCUMENT: "Tài liệu",
  CATEGORY: "Khoa",
  USER: "Người dùng",
  GROUP: "Nhóm quyền",
  AUDIT_LOG: "Audit log",
  EXPORT: "Export",
};

export const subjectLabel = (subject) =>
  `${subject.name || subject.subjectName || `Môn #${subject.subjectId}`} (ID: ${subject.subjectId})`;

export const permissionKey = (permission) =>
  `${permission.scopeType}:${permission.scopeId || ""}:${permission.resource}:${permission.action}`;
