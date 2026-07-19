import React from 'react';
import Account from 'pages/Account';
import ExamAttemptDetail from 'pages/Account/ExamAttemptDetail';
import ForgotPassword from 'pages/Auth/ForgotPassword';
import Login from 'pages/Auth/Login';
import RegisterForm from 'pages/Auth/Register';
import VerifyEmail from 'pages/Auth/VerifyEmail';
import Documents from 'pages/Documents';
import Home from 'pages/Home';
import Notifications from 'pages/Notifications';
import Privacy from 'pages/Privacy';
import Rank from 'pages/Rank';
import Subject from 'pages/Subject';
import ChapterPractice from 'pages/Subject/ChapterPractice';
import SubjectDetail from 'pages/Subject/Detail';
import Exam from 'pages/Subject/Exam';
import Result from 'pages/Subject/Exam/Result';
import Terms from 'pages/Terms';

export const standaloneRoutes = [
  { path: '/login', element: <Login />, guard: 'guest' },
  { path: '/register', element: <RegisterForm />, guard: 'guest' },
  { path: '/forgot', element: <ForgotPassword /> },
  { path: '/verify-email', element: <VerifyEmail /> },
];

export const layoutRoutes = [
  { path: '/', element: <Home /> },
  {
    path: '/subjects/:subjectId/exams/:examId',
    element: <Exam />,
    guard: 'protected',
  },
  {
    path: '/subjects/:subjectId/exams/:examId/result',
    element: <Result />,
    guard: 'protected',
  },
  {
    path: '/subjects/:subjectId/chapters/:chapterId',
    element: <ChapterPractice />,
    guard: 'protected',
  },
  {
    path: '/subjects/:subjectId/practice',
    element: <ChapterPractice />,
    guard: 'protected',
  },
  {
    path: '/account',
    element: <Account />,
    guard: 'protected' },
  {
    path: '/account/exam-attempts/:userExamId',
    element: <ExamAttemptDetail />,
    guard: 'protected',
  },
  {
    path: '/notifications',
    element: <Notifications />,
    guard: 'protected'
  },
  { path: '/subjects', element: <Subject /> },
  { path: '/subjects/:subjectId', element: <SubjectDetail /> },
  { path: '/documents', element: <Documents /> },
  { path: '/rank', element: <Rank /> },
  { path: '/terms', element: <Terms /> },
  { path: '/privacy', element: <Privacy /> },
];
