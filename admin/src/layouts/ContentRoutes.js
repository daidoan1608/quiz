import React from "react";
import { Route, Routes } from "react-router-dom";
import GetChapter from "../pages/Chapter/index.jsx";
import GetExam from "../pages/Exam/index.jsx";
import ContentHome from "../pages/Home/index.jsx";
import GetQuestion from "../pages/Question/index.jsx";
import GetSubject from "../pages/Subject/index.jsx";
import GetUser from "../pages/User/index.jsx";
import GetUserExam from "../pages/ExamUser/GetUserExam.jsx";
import GetUserExambyId from "../pages/ExamUser/GetUserExambyId.jsx";
import GetCategories from "../pages/Categories/index.jsx";
import NotificationManager from "../pages/NotificationManager.jsx";

export default function ContentRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ContentHome />} />
      <Route path="/users" element={<GetUser />} />
      <Route path="/exams" element={<GetExam />} />
      <Route path="/categories" element={<GetCategories />} />
      <Route path="/subjects" element={<GetSubject />} />
      <Route path="/chapters" element={<GetChapter />} />
      <Route path="/questions" element={<GetQuestion />} />
      <Route path="/userexams" element={<GetUserExam />} />
      <Route path="/userexam/:userExamId" element={<GetUserExambyId />} />
      <Route path="/notifications" element={<NotificationManager />} />
    </Routes>
  );
}
