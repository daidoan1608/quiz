const RECENT_DAYS = 7;
const MIN_EXAM_QUESTIONS = 10;

export const getListFromPage = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  return [];
};

export const isRecent = (value, days = RECENT_DAYS) => {
  if (!value) return false;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  return Date.now() - time <= days * 24 * 60 * 60 * 1000;
};

export const formatAlertTime = (value) => (value ? new Date(value).toLocaleString() : "Vừa cập nhật");

const includesAny = (value, keywords) => {
  const normalized = String(value || "").toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
};

export const buildAuditAlerts = (logs = []) =>
  logs
    .filter((log) => isRecent(log.createdAt))
    .flatMap((log) => {
      const action = String(log.action || "").toUpperCase();
      const description = log.description || "";
      const alerts = [];

      if (includesAny(description, ["excel", "import", "lỗi import", "failed import"])) {
        alerts.push({
          id: `audit-import-${log.auditLogId}`,
          group: "Hệ thống",
          level: "error",
          iconType: "fileExcel",
          title: "Có dấu hiệu lỗi import Excel",
          description,
          time: log.createdAt,
        });
      }

      if (includesAny(description, ["exception", "error", "lỗi", "failed", "500"])) {
        alerts.push({
          id: `audit-error-${log.auditLogId}`,
          group: "Hệ thống",
          level: "warning",
          iconType: "exception",
          title: "Admin action có lỗi gần đây",
          description,
          time: log.createdAt,
        });
      }

      if (["DELETE", "RESTORE"].includes(action)) {
        alerts.push({
          id: `audit-${action}-${log.auditLogId}`,
          group: "Hệ thống",
          level: action === "DELETE" ? "warning" : "info",
          iconType: "database",
          title: action === "DELETE" ? "Dữ liệu vừa bị xóa mềm" : "Dữ liệu vừa được khôi phục",
          description:
            description ||
            `${log.entityType || "Dữ liệu"} #${log.entityId || "-"} bởi ${
              log.actorUsername || log.actorId || "System"
            }`,
          time: log.createdAt,
        });
      }

      if (action === "CREATE" && String(log.entityType || "").toUpperCase() === "USER") {
        alerts.push({
          id: `audit-user-${log.auditLogId}`,
          group: "Người dùng",
          level: "info",
          iconType: "user",
          title: "User mới được tạo",
          description,
          time: log.createdAt,
        });
      }

      return alerts;
    });

export const buildContentAlerts = (questions = [], exams = []) => {
  const alerts = [];
  const questionsByChapter = questions.reduce((map, question) => {
    const chapterKey = question.chapterId || "unknown";
    map.set(chapterKey, {
      chapterName: question.chapterName || `Chương #${chapterKey}`,
      count: (map.get(chapterKey)?.count || 0) + 1,
    });
    return map;
  }, new Map());

  questions
    .filter((question) => !question.deleted)
    .filter((question) => !(question.answers || []).some((answer) => answer.isCorrect))
    .slice(0, 8)
    .forEach((question) => {
      alerts.push({
        id: `question-missing-correct-${question.questionId}`,
        group: "Nội dung",
        level: "error",
        iconType: "fileText",
        title: "Câu hỏi thiếu đáp án đúng",
        description: `Câu hỏi #${question.questionId} trong ${question.chapterName || "chưa rõ chương"} cần kiểm tra lại đáp án.`,
      });
    });

  Array.from(questionsByChapter.entries())
    .filter(([, value]) => value.count > 0 && value.count < 5)
    .slice(0, 6)
    .forEach(([chapterId, value]) => {
      alerts.push({
        id: `chapter-low-question-${chapterId}`,
        group: "Nội dung",
        level: "warning",
        iconType: "warning",
        title: "Chương có ít câu hỏi",
        description: `${value.chapterName} hiện chỉ có ${value.count} câu hỏi.`,
      });
    });

  exams
    .filter((exam) => !exam.deleted)
    .filter((exam) => Array.isArray(exam.questions) && exam.questions.length < MIN_EXAM_QUESTIONS)
    .slice(0, 6)
    .forEach((exam) => {
      alerts.push({
        id: `exam-low-question-${exam.examId}`,
        group: "Nội dung",
        level: "warning",
        iconType: "fileText",
        title: "Đề thi chưa đủ số câu",
        description: `${exam.title || `Đề thi #${exam.examId}`} hiện có ${exam.questions.length}/${MIN_EXAM_QUESTIONS} câu.`,
      });
    });

  return alerts;
};

export const buildUserAlerts = (users = []) =>
  users
    .filter((user) => user.deleted || isRecent(user.createdAt))
    .slice(0, 8)
    .map((user) => ({
      id: `user-${user.userId}`,
      group: "Người dùng",
      level: user.deleted ? "warning" : "info",
      iconType: "user",
      title: user.deleted ? "User đang bị khóa/xóa mềm" : "User mới đăng ký",
      description: `${user.fullName || user.username || "Người dùng"} (${user.email || user.username || user.userId})`,
      time: user.deletedAt || user.createdAt,
    }));

export const getBadgeStatus = (level) => {
  if (level === "error") return "error";
  if (level === "warning") return "warning";
  return "processing";
};
