import "./style/App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RevisionUser from "./components/Revision/RevisionUser/RevisionUser";
import RevisionListChap from "./components/Revision/RevisionListChap/RevisionListChap";
import RevisionChap from "./components/Revision/RevisionChap/RevisionChap";
import Home from "./components/User/Home";
import Login from "./components/User/Login";
import RegisterForm from "./components/User/Register";
import ListExam from "./components/Exam/ListExam/ListExam";
import Exam from "./components/Exam/Exam/Exam";
import Result from "./components/Exam/Result/Result";
import DetailExam from "./components/Exam/DetailExam/DetailExam";
import ChooseExam from "./components/Exam/ChooseExam/ChooseExam";
import Account from "./components/Account/Account";
import { AuthProvider } from "./components/Context/AuthProvider";
import GuestOnlyRoute from "./components/Context/GuestOnlyRoute";
import ProtectedRoute from "./components/Context/ProtectedRoute";
import Layout from "./components/User/Layout";
import ForgotPassword from "./components/User/ForgotPassword";


function App() {
  return (
    <AuthProvider>
      <Router>
        {" "}
        <Routes>
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
          <Route element={<Layout />}>
            <Route
              exact
              path="/taketheexam"
              element={
                <ProtectedRoute>
                  <Exam />
                </ProtectedRoute>
              }
            />
            <Route
              exact
              path="/chap"
              element={
                <ProtectedRoute>
                  <RevisionChap />
                </ProtectedRoute>
              }
            />
            <Route exact path="/revision" element={<RevisionUser />} />
            <Route exact path="/chooseExams" element={<ChooseExam />} />
            <Route exact path="/" element={<Home />} />
            {/* Ôn Tập */}
            <Route path="/listChap" element={<RevisionListChap />} />
            {/* Danh sách chương */}
            <Route path="/account" element={<Account />} />
            {/* Trang chọn đề */}
            <Route exact path="/exams" element={<ListExam />} />
            {/* Bài Thi */}
            <Route exact path="/detail" element={<DetailExam />} />
            {/* Chi tiết bài thi */}
            <Route exact path="/result" element={<Result />} />
            {/* Kết quả thi */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
