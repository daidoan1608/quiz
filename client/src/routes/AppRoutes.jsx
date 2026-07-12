// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "context/AuthProvider";

// Import các components bảo vệ
import GuestOnlyRoute from "context/GuestOnlyRoute";
import ProtectedRoute from "context/ProtectedRoute";

// Import Layout
import Layout from "layouts";

// Import Pages (Đường dẫn dựa trên code cũ của bạn)
import Login from "pages/Auth/Login";
import RegisterForm from "pages/Auth/Register";
import ForgotPassword from "pages/Auth/ForgotPassword";
import VerifyEmail from "pages/Auth/VerifyEmail";
import Home from "pages/Home";
import Subject from "pages/Subject";
import SubjectDetail from "pages/Subject/Detail";
import ChapterPractice from "pages/Subject/ChapterPractice";
import Exam from "pages/Subject/Exam";
import Result from "pages/Subject/Exam/Result";
import ExamAttemptDetail from "pages/Account/ExamAttemptDetail";
import Account from "pages/Account";
import Rank from "pages/Rank";
import Notifications from "pages/Notifications";
import Terms from "pages/Terms";
import Privacy from "pages/Privacy";

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
        <Route path="/subjects/:subjectId/chapters/:chapterId" element={<ProtectedRoute><ChapterPractice /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/account/detail" element={<ProtectedRoute><ExamAttemptDetail /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        {/* Nhóm trang môn học: chọn môn -> ôn tập / kiểm tra */}
        <Route path="/subjects" element={<Subject />} />
        <Route path="/subjects/:subjectId" element={<SubjectDetail />} />

        {/* Nhóm trang cá nhân & Tiện ích */}

        <Route path="/rank" element={<Rank />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;