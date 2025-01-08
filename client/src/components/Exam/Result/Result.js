import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Result.css';


export default function Result() {
  const { state } = useLocation(); // Lấy dữ liệu từ navigation
  const navigate = useNavigate();
  const { examId, userExamId, correctAnswers, timeTaken, totalQuestions } = state || {};
  
  const score = ((correctAnswers / totalQuestions) * 100).toFixed(2); // Tính điểm

  // Xử lý điều hướng khi nhấn "Xem bài thi"
  const handleDetail = () => {
    navigate('/detail', { state: { examId, userExamId } });
  };

  // Xử lý điều hướng khi nhấn "Thoát"
  const handleExit = () => {
    navigate('/chooseExams');
  };

  return (
    <>
      <div className="category-result">
        <div className="result-card">
          <div className="result-img">
            <img
              alt="Một chiếc đèn bàn chiếu sáng một chồng sách"
              src="den.jpg"
            />
          </div>
          <div className="result-text">
            <h1>KẾT QUẢ BÀI THI!</h1>
            <p>CÂU ĐÚNG: {correctAnswers}/{totalQuestions}</p>
            <p>THỜI GIAN: {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}</p>
            <p>ĐIỂM: {score}</p>
            <button className="submit-btn-result" onClick={handleDetail}>Xem bài thi</button>
            <button className="submit-btn-result" onClick={handleExit}>THOÁT</button>
          </div>
        </div>
      </div>
    </>
  );
}
