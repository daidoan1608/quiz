import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Result.css';
import { useLanguage } from '../../Context/LanguageProvider';


export default function Result() {
  const { state } = useLocation(); // Lấy dữ liệu từ navigation
  const navigate = useNavigate();
  const { examId, userExamId, correctAnswers, timeTaken, totalQuestions } = state || {};
  const { texts } = useLanguage();
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
            <h1>{texts.result}</h1>
            <p>{texts.correct}: {correctAnswers}/{totalQuestions}</p>
            <p>{texts.time}: {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}</p>
            <p>{texts.score}: {score}</p>
            <button className="submit-btn-result" onClick={handleDetail}>{texts.detail}</button>
            <button className="submit-btn-result" onClick={handleExit}>{texts.exit}</button>
          </div>
        </div>
      </div>
    </>
  );
}
