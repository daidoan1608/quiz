import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import "./ListExam.css";
import Headers from "../../Headers";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../../Footer";
import LoginPrompt from "../../User/LoginPrompt";
import { useAuth } from "../../Context/AuthProvider";

export default function ExamUsers() {
  const [examDto, setExamUsers] = useState([]);
  const [completedExams, setCompletedExams] = useState(new Set());
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { subjectId } = location.state || {};
  const { isLoggedIn } = useAuth(); // Lấy trạng thái và hàm logout từ context
  

  useEffect(() => {
    getAllExam();
    const savedCompletedExams =
      JSON.parse(localStorage.getItem("completedExams")) || [];
      setCompletedExams(new Set(savedCompletedExams));
  }, []);

  const getAllExam = async () => {
    try {
      const resp = await publicAxios.get(`/public/exams/${subjectId}`);
      if (resp.data.responseCode === "404") {
        setError(resp.data.responseMessage);
        setExamUsers([]);
      } else {
        setExamUsers(resp.data);
        setError(null);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
      setExamUsers([]);
    }
  };

  const handleExamClick = (examId) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    const startTime = new Date().toISOString();
    navigate("/taketheexam", { state: { examId, startTime } });
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleClosePrompt = () => {
    setShowLoginPrompt(false);
  };

  const elementExamUsers = examDto.map((item, index) => {
    const isCompleted = completedExams.has(item.examId);
    return (
      <div
        key={index}
        className={`card ${isCompleted ? "completed" : ""}`}
        // onClick={() => handleExamClick(item.examId)}
      >
        <div className="card-content-listexam">
          <h2>{item.title}</h2>
          <h3>{item.description}</h3>
          <div className="details">
            <span>Lần thi:</span>

          </div>
        </div>
        <button
          className="card-button-listexam"
          onClick={(e) => {
            e.stopPropagation();
            handleExamClick(item.examId);
          }}
        >
          Làm bài
        </button>
      </div>
    );
  });

  return (
    <div>
      {/* <Headers /> */}
      <Headers />
      {showLoginPrompt && (
        <LoginPrompt
          onLoginRedirect={handleLoginRedirect}
          onClose={handleClosePrompt}
        />
      )}
      {/* Check for error or no questions */}
      {error ? (
        <div className="error-message">{error}</div>
      ) : examDto.length === 0 ? (
        <div className="no-questions-message">
          Không có bài thi nào trong chương này.
        </div>
      ) : (
        <>
          <div className="category-exam">
            <div className="container-exam">
              <div className="category-header">HÃY CHỌN BÀI THI!</div>
              {elementExamUsers}
            </div>
          </div>
        </>
      )}
      <Footer />
    </div>
  );
}
