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
import Home from "../components/User/Home";
import RevisionUser from "../components/Revision/RevisionUser/RevisionUser";
import RevisionListChap from "../components/Revision/RevisionListChap/RevisionListChap";
import RevisionChap from "../components/Revision/RevisionChap/RevisionChap";
import ChooseExam from "../components/Exam/ChooseExam/ChooseExam";
import ListExam from "../components/Exam/ListExam/ListExam";
import Exam from "../components/Exam/Exam/Exam";
import Result from "../components/Exam/Result/Result";
import DetailExam from "../components/Exam/DetailExam/DetailExam";
import Account from "../components/Account/Account";
import Rank from "../components/Rank/Rank";
import LessonList from "../components/favorites/LessonList";
import Notifications from "../components/pages/Notifications";

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading xác thực...</div>;

  return (
    <Routes>
      {/* --- PUBLIC / GUEST ROUTES --- */}
      <Route path="/login" element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
      <Route path="/register" element={<GuestOnlyRoute><RegisterForm /></GuestOnlyRoute>} />
      <Route path="/forgot" element={<ForgotPassword />} />

      {/* --- PROTECTED ROUTES (Có Header/Footer) --- */}
      <Route element={<Layout />}>
        {/* Trang chủ có thể public hoặc private tùy logic, ở đây giả sử public trong layout */}
        <Route path="/" element={<Home />} />

        {/* Các trang cần đăng nhập */}
        <Route path="/taketheexam" element={<ProtectedRoute><Exam /></ProtectedRoute>} />
        <Route path="/chapter" element={<ProtectedRoute><RevisionChap /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        {/* Nhóm trang ôn tập */}
        <Route path="/revision" element={<RevisionUser />} />
        <Route path="/list-chapter" element={<RevisionListChap />} />

        {/* Nhóm trang thi cử */}
        <Route path="/exam" element={<ChooseExam />} />
        <Route path="/list-exam" element={<ListExam />} />
        <Route path="/detail" element={<DetailExam />} />
        <Route path="/result" element={<Result />} />

        {/* Nhóm trang cá nhân & Tiện ích */}

        <Route path="/rank" element={<Rank />} />
        <Route path="/favorites" element={<LessonList />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;