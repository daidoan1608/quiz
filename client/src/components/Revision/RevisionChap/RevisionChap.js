import React, { useEffect, useState, useRef } from "react";
import axiosLocalApi from "../../../api/local-api";
import { useLocation } from "react-router-dom";
import "./RevisionChap.css";
import Headers from "../../Header";
import Footer from "../../Footer";
import Headers2 from "../../Headers2";

export default function RevisionChap1() {
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;
  const location = useLocation();
  const { chapterId } = location.state || {};

  const questionRefs = useRef([]);

  useEffect(() => {
    const getAllQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axiosLocalApi.get(
          `/public/chapter/questions/${chapterId}`
        );

        if (response.data.responseCode === "404") {
          setError(response.data.responseMessage);
          setQuestionAnswers([]);
        } else {
          setQuestionAnswers(response.data);
        }
      } catch (error) {
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
        setQuestionAnswers([]);
      } finally {
        setIsLoading(false);
      }
    };

    getAllQuestions();
  }, [chapterId]);

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleArrowChange = (direction) => {
    const newPage = currentPage + direction;
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  const goToQuestion = (questionIndex) => {
    const newPage = Math.floor(questionIndex / questionsPerPage) + 1;
    setCurrentPage(newPage);

    // Scroll to the question
    questionRefs.current[questionIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const totalQuestions = questionAnswers.length;
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);

  const startIndex = (currentPage - 1) * questionsPerPage;
  const currentQuestions = questionAnswers.slice(
    startIndex,
    startIndex + questionsPerPage
  );

  if (isLoading) return <div>Đang tải dữ liệu...</div>;

  // Render questions or a message if there are none
  const renderQuestions = currentQuestions.map((item, questionIndex) => {
    const globalQuestionIndex = startIndex + questionIndex;
    const selectedAnswerIndex = selectedAnswers[globalQuestionIndex];

    return (
      <div
        key={item.questionId}
        className="container-end"
        ref={(el) => (questionRefs.current[globalQuestionIndex] = el)}
      >
        <div className="question">
          {item.content}
          {/* câu{globalQuestionIndex+1}: */}
        </div>
        <div className="options">
          {item.answers?.map((answer, answerIndex) => {
            const isSelected = selectedAnswerIndex === answerIndex;
            return (
              <label key={answer.optionId} className="answer-label">
                <input
                  type="radio"
                  name={`question-${globalQuestionIndex}`}
                  value={answerIndex}
                  checked={isSelected}
                  onChange={() =>
                    handleAnswerChange(globalQuestionIndex, answerIndex)
                  }
                  className="answer-input"
                />
                <span className={`answer-span ${isSelected ? "selected" : ""}`}>
                  {answer.content}
                </span>
              </label>
            );
          })}
        </div>
        {selectedAnswerIndex !== undefined && (
          <div className="feedback">
            {item.answers[selectedAnswerIndex].isCorrect ? (
              <span className="correct">Đáp án đúng!</span>
            ) : (
              <span className="incorrect">
                Đáp án sai! Vui lòng thử lại.
              </span>
            )}
          </div>
        )}
      </div>
    );
  });

  return (
    <div>
      {/* <Headers /> */}
      <Headers2 />

      <div className="revision-container">
        {/* Check for error or no questions */}
        {error ? (
          <div className="error-message">{error}</div>
        ) : totalQuestions === 0 ? (
          <div className="no-questions-message">Không có câu hỏi nào trong chương này.</div>
        ) : (
          <>
            {/* Question Selector */}
            {/* Chọn câu trả lời */}
            <div className="question-selector">
              <h3>Chọn câu trả lời</h3>
              <div className="question-list">
                {/* Mũi tên trái */}
                <button
                  onClick={() => handleArrowChange(-1)}
                  disabled={currentPage === 1}
                >
                  <i className="fa-solid fa-arrow-left"></i>
                </button>

                {/* Các nút câu hỏi (cập nhật lại chỉ hiển thị số câu hỏi cho trang hiện tại) */}
                {questionAnswers
                  .slice((currentPage - 1) * questionsPerPage, currentPage * questionsPerPage)
                  .map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToQuestion((currentPage - 1) * questionsPerPage + index)}
                      className={`question-button ${
                        selectedAnswers[(currentPage - 1) * questionsPerPage + index] !== undefined ? "answered" : ""
                      }`}
                    >
                      {(currentPage - 1) * questionsPerPage + index + 1}
                    </button>
                  ))}

                {/* Mũi tên phải */}
                <button
                  onClick={() => handleArrowChange(1)}
                  disabled={currentPage === totalPages}
                >
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>

            {/* Display Questions */}
            <div className="revision-right">
              {renderQuestions}

              {/* Pagination */}
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Trang trước
                </button>

                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(idx + 1)}
                    className={currentPage === idx + 1 ? "active" : ""}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Trang sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
