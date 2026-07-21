import React from "react";

const AdminGroups = React.lazy(() => import("../pages/AdminGroups"));
const AdminGroupFormPage = React.lazy(() => import("../pages/AdminGroups/AdminGroupFormPage"));
const AuditLog = React.lazy(() => import("../pages/AuditLog"));
const ContentHome = React.lazy(() => import("../pages/Home"));
const DocumentsManager = React.lazy(() => import("../pages/Documents"));
const GetCategories = React.lazy(() => import("../pages/Categories"));
const GetChapter = React.lazy(() => import("../pages/Chapter"));
const GetExam = React.lazy(() => import("../pages/Exam"));
const ExamCreatePage = React.lazy(() => import("../pages/Exam/ExamCreatePage"));
const ExamPrintPreviewPage = React.lazy(() => import("../pages/Exam/ExamPrintPreviewPage"));
const ExamUpdatePage = React.lazy(() => import("../pages/Exam/ExamUpdatePage"));
const GetQuestion = React.lazy(() => import("../pages/Question"));
const QuestionCreatePage = React.lazy(() => import("../pages/Question/QuestionCreatePage"));
const QuestionImportPage = React.lazy(() => import("../pages/Question/QuestionImportPage"));
const QuestionUpdatePage = React.lazy(() => import("../pages/Question/QuestionUpdatePage"));
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
    path: "/groups/create",
    Component: AdminGroupFormPage,
    parentPath: "/groups",
  },
  {
    path: "/groups/:groupId/edit",
    Component: AdminGroupFormPage,
    parentPath: "/groups",
  },
  {
    path: "/userexam/:userExamId",
    Component: UserExamDetailPageView,
    parentPath: "/userexams",
  },
  {
    path: "/questions/create",
    Component: QuestionCreatePage,
    parentPath: "/questions",
  },
  {
    path: "/questions/import",
    Component: QuestionImportPage,
    parentPath: "/questions",
  },
  {
    path: "/questions/:questionId/edit",
    Component: QuestionUpdatePage,
    parentPath: "/questions",
  },
  {
    path: "/exams/:examId/print-preview",
    Component: ExamPrintPreviewPage,
    parentPath: "/exams",
  },
  {
    path: "/exams/create",
    Component: ExamCreatePage,
    parentPath: "/exams",
  },
  {
    path: "/exams/:examId/edit",
    Component: ExamUpdatePage,
    parentPath: "/exams",
  },
];
