import GetChapter from "../pages/Chapter/index.jsx";
import GetExam from "../pages/Exam/index.jsx";
import ContentHome from "../pages/Home/index.jsx";
import GetQuestion from "../pages/Question/index.jsx";
import GetSubject from "../pages/Subject/index.jsx";
import GetUser from "../pages/User/index.jsx";
import GetUserExam from "../pages/ExamUser";
import UserExamDetailPageView from "../pages/ExamUser/components/UserExamDetailPageView";
import GetCategories from "../pages/Categories/index.jsx";
import Notification from "../pages/Notification";
import AuditLog from "../pages/AuditLog";
import DocumentsManager from "../pages/Documents";
import AdminGroups from "../pages/AdminGroups";

export const adminLayoutRoutes = [
  { path: "/", element: <ContentHome /> },
  { path: "/users", element: <GetUser /> },
  { path: "/groups", element: <AdminGroups /> },
  { path: "/exams", element: <GetExam /> },
  { path: "/categories", element: <GetCategories /> },
  { path: "/subjects", element: <GetSubject /> },
  { path: "/chapters", element: <GetChapter /> },
  { path: "/questions", element: <GetQuestion /> },
  { path: "/userexams", element: <GetUserExam /> },
  { path: "/notifications", element: <Notification /> },
  { path: "/documents", element: <DocumentsManager /> },
  { path: "/audit-logs", element: <AuditLog /> },
];

export const adminDetailRoutes = [
  {
    path: "/userexam/:userExamId",
    element: <UserExamDetailPageView />,
    parentPath: "/userexams",
  },
];
