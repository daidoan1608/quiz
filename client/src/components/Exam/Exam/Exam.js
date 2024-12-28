<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import axiosLocalApi from "../../../api/local-api"; // Giả sử bạn đã cấu hình axios đúng
import { useNavigate, useLocation } from 'react-router-dom';
import './Exam.css';
import Headers from '../../Header';
import Footer from '../../Footer';
import Headers2 from '../../Headers2';
// import { Footer } from 'antd/es/layout/layout';
=======
import React, { useState, useEffect, useRef, useCallback } from "react";
import { authAxios } from "../../../api/axiosConfig";
import { useNavigate, useLocation } from "react-router-dom";
import "./Exam.css";
import Headers from "../../Header";
import Footer from "../../Footer";
>>>>>>> bbe4d1c3caf38a04cfb7e4fec2fffa884079c8cb

export default function Exam() {
  const [questions, setExamQuestionAnswers] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
<<<<<<< HEAD
  const { examId , startTime } = location.state || {};
  const questionRefs = useRef([]); // Tạo refs cho từng câu hỏi  
  const accessToken = localStorage.getItem('accessToken');
  const questionsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1); //tăng số câu
  const [questionAnswers, setQuestionAnswers] = useState([]);
=======
  const { examId, startTime } = location.state || {};
  const questionRefs = useRef([]);
>>>>>>> bbe4d1c3caf38a04cfb7e4fec2fffa884079c8cb

  const handleSubmit = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    const endTime = new Date().toISOString();
    const correctAnswers = questions.reduce((count, question, index) => {
      const userAnswerIndex = selectedAnswers[index];
      if (userAnswerIndex !== undefined) {
        const selectedAnswer = question.answers[userAnswerIndex];
        return selectedAnswer.isCorrect ? count + 1 : count;
      }
      return count;
    }, 0);

    const score = (correctAnswers / questions.length) * 100;

    const userAnswerDtos = Object.entries(selectedAnswers)
      .map(([questionIndex, answerIndex]) => {
        const question = questions[questionIndex];
        if (!question) return null;
        const answer = question.answers[answerIndex];
        if (!answer) return null;
        return {
          questionId: question.questionId,
          answerId: answer.answerId || answer.optionId,
        };
      })
      .filter(Boolean);

    const payload = {
      userExamDto: {
        userId,
        examId,
        startTime,
        endTime,
        score,
      },
      userAnswerDtos,
    };

    try {
      const response = await authAxios.post("/userexams", payload);

      if (response.status === 200) {
        const { userExamId } = response.data;

        alert("Nộp bài thành công!");
        navigate("/result", {
          state: {
            examId,
            userExamId,
            correctAnswers,
            timeTaken: duration * 60 - timeLeft,
            totalQuestions: questions.length,
          },
        });
      } else {
        alert("Nộp bài thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi nộp bài:", error);

      if (error.response?.status === 400) {
        alert("Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu.");
      } else if (error.response?.status === 403) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
      } else {
        alert("Đã xảy ra lỗi khi nộp bài. Vui lòng thử lại sau.");
      }
    }
  }, [questions, selectedAnswers, examId, startTime, duration, timeLeft, navigate]);

  useEffect(() => {
    const getAllQuestionsByExamId = async () => {
      try {
        const response = await authAxios.get(`/exams/${examId}`);
        setSubjectName(response.data.subjectName);
        setTitle(response.data.title);
        setDuration(response.data.duration);
        setTimeLeft(response.data.duration * 60);
        setExamQuestionAnswers(response.data.questions);
        questionRefs.current = response.data.questions.map(() =>
          React.createRef()
        );
      } catch (error) {
        if (error.response?.status === 403) {
          console.error("Không có quyền truy cập.");
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          navigate("/login");
        } else {
          console.error("Lỗi khi lấy dữ liệu:", error);
          alert("Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.");
        }
      }
    };
    getAllQuestionsByExamId();
  }, [examId, navigate]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
    }
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, handleSubmit]);

  const scrollToQuestion = (index) => {
    if (questionRefs.current[index]?.current) {
      questionRefs.current[index].current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

<<<<<<< HEAD
  const elementexamQuestionAnswers = questions?.map((item, questionIndex) => {
    return (
      <div 
        key={item.questionId} 
        className="container-end"
        ref={questionRefs.current[questionIndex]} // Thêm ref cho mỗi câu hỏi: Câu {questionIndex + 1}:
      >
        <div className="question"> {item.content}</div>
        <div className="options">
          {item.answers?.map((answer, answerIndex) => {
            const isSelected = selectedAnswers[questionIndex] === answerIndex;
            return (
              <label key={answer.optionId} style={{ display: 'block', margin: '5px 0' }}>
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  value={answerIndex}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(questionIndex, answerIndex)}
                  style={{
                    marginRight: '5px',
                    cursor: 'pointer',
                  }}
                />
                <span
                  style={{
                    backgroundColor: isSelected ? 'lightblue' : 'transparent',
                    padding: '5px 10px',
                    border: isSelected ? '2px solid blue' : '1px solid grey',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'inline-block',
                    fontWeight: 'bold',
                  }}
                >
                  {answer.content}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  });
=======
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: answerIndex,
    }));
  };
>>>>>>> bbe4d1c3caf38a04cfb7e4fec2fffa884079c8cb


  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const handleArrowChange = (direction) => {
    const newPage = currentPage + direction;
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const totalQuestions = questions.length; // Số lượng câu hỏi
  const totalPages = Math.ceil(totalQuestions / questionsPerPage); // Tổng số trang (số câu hỏi chia cho 8 câu mỗi trang)
  
  const startIndex = (currentPage - 1) * questionsPerPage; // Vị trí bắt đầu câu hỏi
  const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage); // Câu hỏi cần hiển thị trong trang hiện tại
  
  return (
    <>
      {/* <Headers /> */}
      <Headers2 />
      <div className="category-center">
        <div className="table-left">
          <div className="info">
            <p>
              <span>BÀI THI MÔN:</span> {subjectName}
            </p>
            <p>
              <span>ĐỀ THI:</span> {title}
            </p>
            <p>
              <span>SỐ CÂU:</span> {questions.length}
            </p>
            <p>
              <span>THỜI GIAN:</span> {duration} Phút
            </p>
          </div>
        </div>
        <div className="timer">
            <h2>Thời gian còn lại</h2>
            <span>{`${minutes.toString().padStart(2, "0")}:${seconds
              .toString()
              .padStart(2, "0")}`}</span>
          </div>
        <div className="table-right">
          <div className="answer-sheet">
<<<<<<< HEAD
            <p><span>BẢNG TRẢ LỜI</span></p>
            {/* Mũi tên trái */}
          <button
            onClick={() => handleArrowChange(-1)}
            disabled={currentPage === 1}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>

          {/* Hiển thị số câu hỏi từ 1 đến 8 trên bảng trả lời */}
          {currentQuestions.map((_, idx) => (
            <div
              key={startIndex + idx}
              className={`number ${selectedAnswers[startIndex + idx] !== undefined ? 'selected' : ''}`}
              onClick={() => scrollToQuestion(startIndex + idx)}
              style={{ cursor: 'pointer' }}
            >
              {startIndex + idx + 1} {/* Câu hỏi từ 1 đến 8 */}
            </div>
          ))}

          {/* Mũi tên phải */}
          <button
            onClick={() => handleArrowChange(1)}
            disabled={currentPage === totalPages}
          >
            <i className="fa-solid fa-arrow-right"></i>
          </button>
=======
            <p>
              <span>BẢNG TRẢ LỜI</span>
            </p>
            {[...Array(questions.length)].map((_, idx) => (
              <div
                key={idx}
                className={`number ${
                  selectedAnswers[idx] !== undefined ? "selected" : ""
                }`}
                onClick={() => scrollToQuestion(idx)}
                style={{ cursor: "pointer" }}
              >
                {idx + 1}
              </div>
            ))}
>>>>>>> bbe4d1c3caf38a04cfb7e4fec2fffa884079c8cb
          </div>
        </div>
      </div>
      <div className="category-end">
        {questions.map((item, questionIndex) => (
          <div
            key={item.questionId}
            className="container-end"
            ref={questionRefs.current[questionIndex]}
          >
            <div className="question">
              Câu {questionIndex + 1}: {item.content}
            </div>
            <div className="options">
              {item.answers?.map((answer, answerIndex) => {
                const isSelected = selectedAnswers[questionIndex] === answerIndex;
                return (
                  <label
                    key={answer.optionId}
                    style={{ display: "block", margin: "5px 0" }}
                  >
                    <input
                      type="radio"
                      name={`question-${questionIndex}`}
                      value={answerIndex}
                      checked={isSelected}
                      onChange={() =>
                        handleAnswerSelect(questionIndex, answerIndex)
                      }
                      style={{
                        marginRight: "5px",
                        cursor: "pointer",
                      }}
                    />
                    <span
                      style={{
                        backgroundColor: isSelected ? "lightblue" : "transparent",
                        padding: "5px 10px",
                        border: isSelected ? "2px solid blue" : "1px solid grey",
                        borderRadius: "5px",
                        cursor: "pointer",
                        display: "inline-block",
                        fontWeight: "bold",
                      }}
                    >
                      {answer.content}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
        <button className="submit-btn" onClick={handleSubmit}>
          Nộp bài
        </button>
      </div>
      <Footer />
    </>
  );
}
