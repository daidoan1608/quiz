import React, { lazy } from 'react';

const Account = lazy(() => import('pages/Account'));
const ExamAttemptDetail = lazy(() => import('pages/Account/ExamAttemptDetail'));
const ForgotPassword = lazy(() => import('pages/Auth/ForgotPassword'));
const Login = lazy(() => import('pages/Auth/Login'));
const RegisterForm = lazy(() => import('pages/Auth/Register'));
const VerifyEmail = lazy(() => import('pages/Auth/VerifyEmail'));
const Documents = lazy(() => import('pages/Documents'));
const Home = lazy(() => import('pages/Home'));
const Notifications = lazy(() => import('pages/Notifications'));
const Privacy = lazy(() => import('pages/Privacy'));
const Rank = lazy(() => import('pages/Rank'));
const Subject = lazy(() => import('pages/Subject'));
const ChapterPractice = lazy(() => import('pages/Subject/ChapterPractice'));
const SubjectDetail = lazy(() => import('pages/Subject/Detail'));
const Exam = lazy(() => import('pages/Subject/Exam'));
const Result = lazy(() => import('pages/Subject/Exam/Result'));
const Terms = lazy(() => import('pages/Terms'));

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
