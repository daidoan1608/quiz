export const DASHBOARD_ORDER_STORAGE_KEY = "adminDashboardWidgetOrder";

export const DEFAULT_WIDGET_ORDER = [
  "totalSubjects",
  "totalQuestions",
  "totalExams",
  "totalUsers",
  "overviewChart",
  "difficultyChart",
  "attemptsByDay",
  "hotSubjects",
  "wrongQuestions",
  "activeUsers",
];

export const LIMIT_OPTIONS = [5, 10, 20, 30].map((value) => ({
  value,
  label: `${value} dòng`,
}));
