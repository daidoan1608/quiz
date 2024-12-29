import React from 'react';
import { useNavigate , useLocation } from 'react-router-dom';
import './Result.css';
import Footer from '../../Footer';
import Headers from '../../Headers';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const {examId,userExamId,correctAnswers, timeTaken ,totalQuestions } = location.state || {}; // Lấy dữ liệu từ navigation
  const score = (correctAnswers / totalQuestions).toFixed(2) * 100; // Tính điểm

  const handleDetail = () => {
    navigate('/detail', {state: {examId, userExamId}});
  }

  return (
    <>
      {/* <Headers /> */}
      <Headers />
      <div className="category-result">
        <div className="result-card">
          <div className="result-img">
            <img
              alt="Một chiếc đèn bàn chiếu sáng một chồng sách"
              src="https://s3-alpha-sig.figma.com/img/e41f/cba9/a860f347fa09b516f9bebebcb8fcf1a3?Expires=1734912000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=G129i8jft2QCgEP99rtNevZqQd10cYsgvKQ6tjDf-Qb1Tu0u5~lwugUAtwh0g1P4oMKgnycDT8Il4B7h3pGpSZrIIWGUw4JCp2ov8-fPvxVoT-2MR1BN6rLnSlpAI3EpKgCB2SCBfr3vbcdTz4z3vqL2FIzpF4MumIglMfyUV6Y-BiCIxbtMzy7vsfrP5kqBJRFTXICkwtd3jcoizShLdJrL4an80z2C88MesxZ3q07rnsHi4B8inD2wJJ-t0hWHCjQAOSu8E-FoHM5lq2qG6Ie8oRxnawCRCGr5v-HsVGikjeDlJnuZJAfERdphxaURTOFJ5AXOHMhbuHm33-hbnA__"
            />
          </div>
          <div className="result-text">
            <h1>KẾT QUẢ BÀI THI!</h1>
            <p>CÂU ĐÚNG: {correctAnswers}/{totalQuestions}</p>
            <p>THỜI GIAN: {Math.floor(timeTaken/60)}:{(timeTaken%60).toString().padStart(2, '0')} </p>
            <p>ĐIỂM: {score}</p>
            <button className="submit-btn-result" onClick={handleDetail}>Xem bài thi</button>
              <a href="/chooseExams">
                <button className="submit-btn-result">THOÁT</button>
              </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
