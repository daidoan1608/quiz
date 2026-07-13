import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "context/AuthProvider";
import GuestOnlyRoute from "context/GuestOnlyRoute";
import ProtectedRoute from "context/ProtectedRoute";
import Layout from "layouts";
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

const guest = (element) => <GuestOnlyRoute>{element}</GuestOnlyRoute>;
const protectedRoute = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading authentication...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={guest(<Login />)} />
      <Route path="/register" element={guest(<RegisterForm />)} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/subjects/:subjectId/exams/:examId" element={protectedRoute(<Exam />)} />
        <Route path="/subjects/:subjectId/exams/:examId/result" element={protectedRoute(<Result />)} />
        <Route path="/subjects/:subjectId/chapters/:chapterId" element={protectedRoute(<ChapterPractice />)} />
        <Route path="/account" element={protectedRoute(<Account />)} />
        <Route path="/account/detail" element={protectedRoute(<ExamAttemptDetail />)} />
        <Route path="/notifications" element={protectedRoute(<Notifications />)} />
        <Route path="/subjects" element={<Subject />} />
        <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
        <Route path="/rank" element={<Rank />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
