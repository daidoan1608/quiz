import React, { useState, useEffect, useRef, useCallback } from "react";
import { authAxios } from "../../../api/axiosConfig";
import { useNavigate, useLocation } from "react-router-dom";
import "./Exam.css";
import { useLanguage } from "../../Context/LanguageProvider";

export default function Exam() {
  const [questions, setExamQuestionAnswers] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { examId, startTime } = location.state || {};
  const questionRefs = useRef([]);
  const { texts } = useLanguage();

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
      const response = await authAxios.post("user/userexams", payload);

      if (response.status === 200) {
        const { userExamId } = response.data.data;
        console.log(userExamId);
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
  }, [
    questions,
    selectedAnswers,
    examId,
    startTime,
    duration,
    timeLeft,
    navigate,
  ]);

  useEffect(() => {
    const getAllQuestionsByExamId = async () => {
      try {
        const response = await authAxios.get(`public/exams/${examId}`);
        setSubjectName(response.data.data.subjectName);
        setTitle(response.data.data.title);
        setDuration(response.data.data.duration);
        setTimeLeft(response.data.data.duration * 60);
        setExamQuestionAnswers(response.data.data.questions);
        questionRefs.current = response.data.data.questions.map(() =>
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
    // Chỉ bắt đầu đếm ngược khi timeLeft đã được khởi tạo
    if (timeLeft === null) return;

    if (timeLeft === 0) {
      handleSubmit();
      return;
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

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: answerIndex,
    }));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <>
      <div className="category-center">
        <div className="table-left">
          <div className="info">
            <p>
              <span>{texts.subjectExam}:</span> {subjectName}
            </p>
            <p>
              <span>{texts.topic}:</span> {title}
            </p>
            <p>
              <span>{texts.question}:</span> {questions.length}
            </p>
            <p>
              <span>{texts.time}:</span> {duration} Phút
            </p>
          </div>
          <div className="timer">
            <h2>{texts.conutDown}</h2>
            <span>{`${minutes.toString().padStart(2, "0")}:${seconds
              .toString()
              .padStart(2, "0")}`}</span>
          </div>
        </div>
        <div className="table-right">
          <div className="answer-sheet">
            <p>
              <span>{texts.table}</span>
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
                const isSelected =
                  selectedAnswers[questionIndex] === answerIndex;
                return (
                  <div key={answer.optionId} className="option">
                    <input
                      type="radio"
                      id={answer.optionId}
                      name={`question-${questionIndex}`}
                      value={answerIndex}
                      checked={isSelected}
                      onChange={() =>
                        handleAnswerSelect(questionIndex, answerIndex)
                      }
                      className="radio-input"
                    />
                    <label
                      htmlFor={answer.optionId} // Kết nối label với input qua htmlFor
                      className={`radio-label ${isSelected ? "selected" : ""}`}
                    >
                      {answer.content}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <button className="submit-btn" onClick={handleSubmit}>
          {texts.submit}
        </button>
      </div>
    </>
  );
}
