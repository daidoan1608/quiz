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
// import ReviewExam from "./components/Exam/ReviewExam/ReviewExam";
import DetailExam from "./components/Exam/DetailExam/DetailExam";
import ChooseExam from "./components/Exam/ChooseExam/ChooseExam";

function App() {
  return (
    <Router>
      {" "}
      {/* Đảm bảo <Router> bao bọc toàn bộ ứng dụng */}
      <Routes>
        <Route exact path="/" element={<Home />} />
        {/* Trang Chủ */}
        <Route exact path="/revision" element={<RevisionUser />} />
        {/* Ôn Tập */}
        <Route path="/listChap" element={<RevisionListChap />} />
        {/* Danh sách chương */}
        <Route exact path="/chap" element={<RevisionChap />} />
        {/* câu hỏi ôn tập theo chương */}
        <Route path="/login" element={<Login />} />
        {/* Trang Đăng nhập */}
        <Route path="/register" element={<RegisterForm />} />
        {/* Trang Đăng ký */}
      </Routes>
      <Routes>
        <Route exact path="/chooseExams" element={<ChooseExam />} />
        {/* Trang chọn đề */}
        <Route exact path="/exams" element={<ListExam />} /> 
        {/* Bài Thi */}
        <Route exact path="/detail" element={<DetailExam />} />
        {/* Chi tiết bài thi */}
        <Route exact path="/taketheexam" element={<Exam />} />
        {/* Làm bài thi */}
        <Route exact path="/result" element={<Result />} /> 
        {/* Kết quả thi */}
        {/* <Route exact path="/reviewExam" element={<ReviewExam />} /> */}
        {/* Xem lại bài thi gần nhất ấn bài thi */}
      </Routes>
    </Router>
  );
}

export default App;
