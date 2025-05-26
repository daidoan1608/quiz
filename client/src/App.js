import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import styled from "styled-components";
import { AuthProvider } from "./components/Context/AuthProvider";
import { FavoritesProvider } from "./components/Context/FavoritesContext";

import GuestOnlyRoute from "./components/Context/GuestOnlyRoute";
import ProtectedRoute from "./components/Context/ProtectedRoute";
import Layout from "./components/User/Layout";
import Login from "./components/User/Login";
import RegisterForm from "./components/User/Register";
import ForgotPassword from "./components/User/ForgotPassword";
import Home from "./components/User/Home";
import RevisionUser from "./components/Revision/RevisionUser/RevisionUser";
import RevisionListChap from "./components/Revision/RevisionListChap/RevisionListChap";
import RevisionChap from "./components/Revision/RevisionChap/RevisionChap";
import ChooseExam from "./components/Exam/ChooseExam/ChooseExam";
import ListExam from "./components/Exam/ListExam/ListExam";
import Exam from "./components/Exam/Exam/Exam";
import Result from "./components/Exam/Result/Result";
import DetailExam from "./components/Exam/DetailExam/DetailExam";
import Account from "./components/account/account";
import Rank from "./components/Rank/Rank";
import LessonList from "./components/favorites/LessonList";
import LessonListChap from "./components/favorites/LessonListChap";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // để dropdown hoạt động


function App() {
  return (
    <AuthProvider>
            <FavoritesProvider>  {/* Bọc thêm FavoritesProvider */}

      <Router>
        {/* <AppWrapper> */}
        <Routes>
          {/* Guest Only Routes */}
          <Route
            path="/login"
            element={
              <GuestOnlyRoute>
                <Login />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnlyRoute>
                <RegisterForm />
              </GuestOnlyRoute>
            }
          />
          <Route path="/forgot" element={<ForgotPassword />} />

          {/* Protected Routes wrapped inside Layout */}
          <Route element={<Layout />}>
            <Route
              path="/taketheexam"
              element={
                <ProtectedRoute>
                  <Exam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chap"
              element={
                <ProtectedRoute>
                  <RevisionChap />
                </ProtectedRoute>
              }
            />
            <Route path="/revision" element={<RevisionUser />} />
            <Route path="/chooseExams" element={<ChooseExam />} />
            <Route path="/" element={<Home />} />

            {/* Exam and Revision Routes */}
            <Route path="/listChap" element={<RevisionListChap />} />
            <Route path="/account" element={<Account />} />
            <Route path="/exams" element={<ListExam />} />
            <Route path="/detail" element={<DetailExam />} />
            <Route path="/result" element={<Result />} />
            <Route path="/rank" element={<Rank />} />

            {/* Favorite Lesson Routes */}
            <Route path="/favorites" element={<LessonList />} />
            <Route path="/favoriteslistChap" element={<LessonListChap />} />
          </Route>
        </Routes>
        {/* </AppWrapper> */}
      </Router>
            </FavoritesProvider>  {/* Bọc thêm FavoritesProvider */}

    </AuthProvider>
  );
}

export default App;
