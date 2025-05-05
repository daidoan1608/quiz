import React, { useEffect, useState, useRef } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useLocation } from "react-router-dom";
import "./RevisionChap.css";

export default function RevisionChap1() {
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 8;
  const location = useLocation();
  const { chapterId } = location.state || {};
  

  const questionRefs = useRef([]);

  useEffect(() => {
    const getAllQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await publicAxios.get(
          `/public/questions/chapter/${chapterId}`
        );
        if (response.data.responseCode === "404") {
          setError(response.data.responseMessage);
          setQuestionAnswers([]);
        } else {
          setQuestionAnswers(response.data.data);
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

  const goToQuestion = (questionIndex) => {
    const newPage = Math.floor(questionIndex / questionsPerPage) + 1;
  
    // Chuyển trang trước, sau đó cuộn đến câu hỏi
    if (currentPage !== newPage) {
      setCurrentPage(newPage);
      setTimeout(() => {
        questionRefs.current[questionIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300); // Thời gian chờ để đảm bảo trang mới được render
    } else {
      questionRefs.current[questionIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };
  

  const totalQuestions = questionAnswers.length;
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);

  const startIndex = (currentPage - 1) * questionsPerPage;
  const currentQuestions = questionAnswers.slice(
    startIndex,
    startIndex + questionsPerPage
  );

  if (isLoading) return <div>Đang tải dữ liệu...</div>;

  // Render questions
  const renderQuestions = currentQuestions.map((item, questionIndex) => {
    const globalQuestionIndex = startIndex + questionIndex;

    return (
      <div
        key={item.questionId}
        className="container-end"
        ref={(el) => (questionRefs.current[globalQuestionIndex] = el)}
      >
        <div className="question">
          <strong>Câu {globalQuestionIndex + 1}:</strong> {item.content}
        </div>
        <div className="options">
          {item.answers?.map((answer, answerIndex) => {
            return (
              <label key={answer.optionId} className="answer-label">
                <input
                  type="radio"
                  name={`question-${globalQuestionIndex}`}
                  value={answerIndex}
                  onChange={() =>
                    handleAnswerChange(globalQuestionIndex, answerIndex)
                  }
                  className="answer-input"
                />
                <span className="answer-span">{answer.content}</span>
              </label>
            );
          })}
        </div>
        {selectedAnswers[globalQuestionIndex] !== undefined && (
          <div className="feedback">
            {item.answers[selectedAnswers[globalQuestionIndex]].isCorrect ? (
              <span className="correct">Đáp án đúng!</span>
            ) : (
              <span className="incorrect">Đáp án sai! Vui lòng thử lại.</span>
            )}
          </div>
        )}
      </div>
    );
  });

  return (
    <div>
      <div className={`revision-container ${error ? "center-text" : ""}`}>
        {error ? (
          <div className="error-message">{error}</div>
        ) : totalQuestions === 0 ? (
          <div className="no-questions-message">
            Không có câu hỏi nào trong chương này.
          </div>
        ) : (
          <>
            <div className="question-selector">
              <p>
              <span>Bảng trả lời</span>
              </p>
              <div className="question-list">
                {questionAnswers.map((_, index) => (
                  <div
                    key={index}
                    className={`number ${
                      selectedAnswers[index] !== undefined ? "answered" : ""
                    }`}
                    onClick={() => goToQuestion(index)}
                    style={{ cursor: "pointer" }}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className="revision-right">
              {renderQuestions}
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
    </div>
  );
}
