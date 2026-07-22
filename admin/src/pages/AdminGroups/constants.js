export const GLOBAL_ACTIONS = [
  "VIEW",
  "CREATE",
  "UPDATE",
  "DELETE",
  "RESTORE",
  "EXPORT",
  "SEND",
  "VIEW_RECIPIENTS",
  "RECALL",
];

export const GLOBAL_MATRIX = [
  { resource: "MENU_DASHBOARD", label: "Menu dashboard", actions: ["VIEW"] },
  { resource: "MENU_SUBJECTS", label: "Menu môn học", actions: ["VIEW"] },
  { resource: "MENU_CHAPTERS", label: "Menu chương", actions: ["VIEW"] },
  { resource: "MENU_QUESTIONS", label: "Menu câu hỏi", actions: ["VIEW"] },
  { resource: "MENU_EXAMS", label: "Menu đề thi", actions: ["VIEW"] },
  { resource: "MENU_NOTIFICATIONS", label: "Menu thông báo", actions: ["VIEW"] },
  { resource: "MENU_DOCUMENTS", label: "Menu tài liệu", actions: ["VIEW"] },
  { resource: "MENU_USER_EXAMS", label: "Menu kết quả thi", actions: ["VIEW"] },
  { resource: "MENU_USERS", label: "Menu người dùng", actions: ["VIEW"] },
  { resource: "MENU_GROUPS", label: "Menu nhóm quyền", actions: ["VIEW"] },
  { resource: "MENU_CATEGORIES", label: "Menu khoa", actions: ["VIEW"] },
  { resource: "MENU_AUDIT_LOGS", label: "Menu audit log", actions: ["VIEW"] },
  { resource: "STATISTIC", label: "Thống kê toàn hệ thống", actions: ["VIEW"] },
  {
    resource: "NOTIFICATION",
    label: "Thông báo toàn hệ thống",
    actions: ["VIEW", "SEND", "VIEW_RECIPIENTS", "RECALL"],
  },
  { resource: "USER_EXAM", label: "Kết quả thi toàn hệ thống", actions: ["VIEW", "EXPORT"] },
  { resource: "DOCUMENT", label: "Tài liệu", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
  {
    resource: "CATEGORY",
    label: "Khoa",
    actions: ["VIEW", "CREATE", "UPDATE", "DELETE", "RESTORE"],
  },
  {
    resource: "USER",
    label: "Người dùng",
    actions: ["VIEW", "CREATE", "UPDATE", "DELETE", "RESTORE", "EXPORT"],
  },
  { resource: "GROUP", label: "Nhóm quyền", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
  { resource: "AUDIT_LOG", label: "Audit log", actions: ["VIEW"] },
];

export const SUBJECT_ACTIONS = [
  "VIEW",
  "CREATE",
  "UPDATE",
  "DELETE",
  "RESTORE",
  "IMPORT",
  "EXPORT",
  "SEND",
  "VIEW_RECIPIENTS",
];

export const SUBJECT_MATRIX = [
  {
    resource: "SUBJECT",
    label: "Môn học",
    actions: ["VIEW", "CREATE", "UPDATE", "DELETE", "RESTORE"],
  },
  {
    resource: "CHAPTER",
    label: "Chương",
    actions: ["VIEW", "CREATE", "UPDATE", "DELETE", "RESTORE"],
  },
  {
    resource: "QUESTION",
    label: "Câu hỏi",
    actions: ["VIEW", "CREATE", "UPDATE", "DELETE", "RESTORE", "IMPORT", "EXPORT"],
  },
  {
    resource: "EXAM",
    label: "Đề thi",
    actions: ["VIEW", "CREATE", "UPDATE", "DELETE", "RESTORE", "EXPORT"],
  },
  {
    resource: "NOTIFICATION",
    label: "Thông báo",
    actions: ["VIEW", "SEND", "VIEW_RECIPIENTS"],
  },
  { resource: "STATISTIC", label: "Thống kê", actions: ["VIEW"] },
  { resource: "USER_EXAM", label: "Kết quả thi", actions: ["VIEW", "EXPORT"] },
  { resource: "DOCUMENT", label: "Tài liệu môn học", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
];

export const PRESETS = [
  {
    key: "subject_readonly",
    label: "Chỉ xem môn",
    permissions: [
      ["MENU_SUBJECTS", "VIEW"],
      ["SUBJECT", "VIEW", "SUBJECT"],
    ],
  },
  {
    key: "question_manager",
    label: "Quản lý câu hỏi",
    permissions: [
      ["MENU_SUBJECTS", "VIEW"],
      ["MENU_CHAPTERS", "VIEW"],
      ["MENU_QUESTIONS", "VIEW"],
      ["SUBJECT", "VIEW", "SUBJECT"],
      ["CHAPTER", "VIEW", "SUBJECT"],
      ["QUESTION", "VIEW", "SUBJECT"],
      ["QUESTION", "CREATE", "SUBJECT"],
      ["QUESTION", "UPDATE", "SUBJECT"],
      ["QUESTION", "DELETE", "SUBJECT"],
      ["QUESTION", "IMPORT", "SUBJECT"],
      ["QUESTION", "EXPORT", "SUBJECT"],
    ],
  },
  {
    key: "exam_manager",
    label: "Quản lý đề thi",
    permissions: [
      ["MENU_EXAMS", "VIEW"],
      ["SUBJECT", "VIEW", "SUBJECT"],
      ["QUESTION", "VIEW", "SUBJECT"],
      ["EXAM", "VIEW", "SUBJECT"],
      ["EXAM", "CREATE", "SUBJECT"],
      ["EXAM", "UPDATE", "SUBJECT"],
      ["EXAM", "DELETE", "SUBJECT"],
      ["EXAM", "EXPORT", "SUBJECT"],
    ],
  },
  {
    key: "subject_notification",
    label: "Thông báo môn",
    permissions: [
      ["MENU_NOTIFICATIONS", "VIEW"],
      ["NOTIFICATION", "VIEW", "SUBJECT"],
      ["NOTIFICATION", "SEND", "SUBJECT"],
      ["NOTIFICATION", "VIEW_RECIPIENTS", "SUBJECT"],
    ],
  },
  {
    key: "subject_statistics",
    label: "Thống kê môn",
    permissions: [
      ["MENU_DASHBOARD", "VIEW"],
      ["STATISTIC", "VIEW", "SUBJECT"],
      ["USER_EXAM", "VIEW", "SUBJECT"],
    ],
  },
  {
    key: "subject_exam_results",
    label: "Chỉ kết quả thi",
    permissions: [
      ["MENU_USER_EXAMS", "VIEW"],
      ["USER_EXAM", "VIEW", "SUBJECT"],
      ["USER_EXAM", "EXPORT", "SUBJECT"],
    ],
  },
  {
    key: "subject_full_content",
    label: "Toàn quyền nội dung môn",
    permissions: [
      ["MENU_SUBJECTS", "VIEW"],
      ["MENU_CHAPTERS", "VIEW"],
      ["MENU_QUESTIONS", "VIEW"],
      ["MENU_EXAMS", "VIEW"],
      ["MENU_USER_EXAMS", "VIEW"],
      ["SUBJECT", "VIEW", "SUBJECT"],
      ["SUBJECT", "UPDATE", "SUBJECT"],
      ["CHAPTER", "VIEW", "SUBJECT"],
      ["CHAPTER", "CREATE", "SUBJECT"],
      ["CHAPTER", "UPDATE", "SUBJECT"],
      ["CHAPTER", "DELETE", "SUBJECT"],
      ["QUESTION", "VIEW", "SUBJECT"],
      ["QUESTION", "CREATE", "SUBJECT"],
      ["QUESTION", "UPDATE", "SUBJECT"],
      ["QUESTION", "DELETE", "SUBJECT"],
      ["QUESTION", "IMPORT", "SUBJECT"],
      ["QUESTION", "EXPORT", "SUBJECT"],
      ["EXAM", "VIEW", "SUBJECT"],
      ["EXAM", "CREATE", "SUBJECT"],
      ["EXAM", "UPDATE", "SUBJECT"],
      ["EXAM", "DELETE", "SUBJECT"],
      ["EXAM", "EXPORT", "SUBJECT"],
      ["USER_EXAM", "VIEW", "SUBJECT"],
      ["USER_EXAM", "EXPORT", "SUBJECT"],
    ],
  },
];

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

export const RESOURCE_LABELS = Object.fromEntries(
  [...GLOBAL_MATRIX, ...SUBJECT_MATRIX].map((item) => [item.resource, item.label])
);
