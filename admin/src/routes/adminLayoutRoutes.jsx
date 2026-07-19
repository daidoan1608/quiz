import React from "react";

const AdminGroups = React.lazy(() => import("../pages/AdminGroups"));
const AuditLog = React.lazy(() => import("../pages/AuditLog"));
const ContentHome = React.lazy(() => import("../pages/Home"));
const DocumentsManager = React.lazy(() => import("../pages/Documents"));
const GetCategories = React.lazy(() => import("../pages/Categories"));
const GetChapter = React.lazy(() => import("../pages/Chapter"));
const GetExam = React.lazy(() => import("../pages/Exam"));
const GetQuestion = React.lazy(() => import("../pages/Question"));
const GetSubject = React.lazy(() => import("../pages/Subject"));
const GetUser = React.lazy(() => import("../pages/User"));
const GetUserExam = React.lazy(() => import("../pages/ExamUser"));
const Notification = React.lazy(() => import("../pages/Notification"));
const UserExamDetailPageView = React.lazy(
  () => import("../pages/ExamUser/components/UserExamDetailPageView")
);

export const adminLayoutRoutes = [
  { path: "/", Component: ContentHome },
  { path: "/users", Component: GetUser },
  { path: "/groups", Component: AdminGroups },
  { path: "/exams", Component: GetExam },
  { path: "/categories", Component: GetCategories },
  { path: "/subjects", Component: GetSubject },
  { path: "/chapters", Component: GetChapter },
  { path: "/questions", Component: GetQuestion },
  { path: "/userexams", Component: GetUserExam },
  { path: "/notifications", Component: Notification },
  { path: "/documents", Component: DocumentsManager },
  { path: "/audit-logs", Component: AuditLog },
];

export const adminDetailRoutes = [
  {
    path: "/userexam/:userExamId",
    Component: UserExamDetailPageView,
    parentPath: "/userexams",
  },
];
