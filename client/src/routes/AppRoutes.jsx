// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

// Import các components bảo vệ
import GuestOnlyRoute from "../context/GuestOnlyRoute";
import ProtectedRoute from "../context/ProtectedRoute";

// Import Layout
import Layout from "../layouts/Layout";

// Import Pages (Đường dẫn dựa trên code cũ của bạn)
import Login from "../components/User/Login";
import RegisterForm from "../components/User/Register";
import ForgotPassword from "../components/User/ForgotPassword";
import VerifyEmail from "../components/User/VerifyEmail";
import Home from "../components/User/Home";
import RevisionUser from "../components/Learning/SubjectList/SubjectList";
import RevisionListChap from "../components/Learning/SubjectHub/SubjectHub";
import RevisionChap from "../components/Learning/ChapterPractice/ChapterPractice";
import Exam from "../components/Exam/Exam/Exam";
import Result from "../components/Exam/Result/Result";
import DetailExam from "../components/Exam/DetailExam/DetailExam";
import Account from "../components/Account/Account";
import Rank from "../components/Rank/Rank";
import LessonList from "../components/Favorites/LessonList";
import Notifications from "../components/Pages/Notifications";
import Terms from "../components/Pages/Terms";
import Privacy from "../components/Pages/Privacy";

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading xác thực...</div>;

  return (
    <Routes>
      {/* --- PUBLIC / GUEST ROUTES --- */}
      <Route path="/login" element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
      <Route path="/register" element={<GuestOnlyRoute><RegisterForm /></GuestOnlyRoute>} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* --- PROTECTED ROUTES (Có Header/Footer) --- */}
      <Route element={<Layout />}>
        {/* Trang chủ có thể public hoặc private tùy logic, ở đây giả sử public trong layout */}
        <Route path="/" element={<Home />} />

        {/* Các trang cần đăng nhập */}
        <Route path="/subjects/:subjectId/exams/:examId" element={<ProtectedRoute><Exam /></ProtectedRoute>} />
        <Route path="/subjects/:subjectId/exams/:examId/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
        <Route path="/subjects/:subjectId/chapters/:chapterId" element={<ProtectedRoute><RevisionChap /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/account/detail" element={<ProtectedRoute><DetailExam /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        {/* Nhóm trang môn học: chọn môn -> ôn tập / kiểm tra */}
        <Route path="/subjects" element={<RevisionUser />} />
        <Route path="/subjects/:subjectId" element={<RevisionListChap />} />

        {/* Nhóm trang cá nhân & Tiện ích */}

        <Route path="/rank" element={<Rank />} />
        <Route path="/favorites" element={<LessonList />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;