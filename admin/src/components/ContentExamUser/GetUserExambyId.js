import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { authAxios } from "../../api/axiosConfig";
import "./GetUserExambyId.css";

export default function GetUserExambyId() {
  const { userExamId } = useParams();
  const [examDetail, setExamDetail] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sử dụng useCallback để đóng gói hàm fetch (khắc phục lỗi dependency)
  const fetchExamDetail = useCallback(async () => {
    try {
      const response = await authAxios.get(`/user/userexams/${userExamId}`);
      const detail = response.data.data;
      setExamDetail(detail);

      const examId = detail.userExamDto.examId;
      const questionResponse = await authAxios.get(`/public/exams/${examId}`);
      setExamQuestions(questionResponse.data.data.questions);

      // Gọi API lấy thông tin người dùng từ userId
      const userId = detail.userExamDto.userId;
      const userResponse = await authAxios.get(`/user/${userId}`);
      setUserInfo(userResponse.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết bài thi:", error);
    } finally {
      setLoading(false);
    }
  }, [userExamId]); // Thêm userExamId vào dependency

  useEffect(() => {
    fetchExamDetail();
  }, [fetchExamDetail]); // Thêm fetchExamDetail vào dependency

  if (loading) return <div className="loading-message">Loading ...</div>;
  if (!examDetail)
    return <div className="error-message">Không tìm thấy dữ liệu bài thi.</div>;

  const { subjectName, title, userExamDto, userAnswerDtos } = examDetail;

  const getUserAnswerForQuestion = (questionId) => {
    return userAnswerDtos.find((ans) => ans.questionId === questionId)
      ?.answerId;
  };

  // Kiểm tra nếu điểm đạt được (Giả định điểm tối đa là 100)
  const isPassed = userExamDto.score > 50; // Thay đổi ngưỡng điểm tùy thuộc vào logic của bạn

  return (
    <div className="exam-detail-container">
      <h2 className="mb-4 exam-detail-header">Chi tiết kết quả bài thi</h2>

      {/* Khối Tóm tắt Kết quả và Thông tin User */}
      <div className="summary-section">
        {/* Phần Tóm tắt Điểm */}
        <div className={`score-card ${isPassed ? "score-pass" : "score-fail"}`}>
          <div className="score-label">Điểm số đạt được</div>
          <div className="score-value">{userExamDto.score}</div>
        </div>

        {/* Phần Thông tin chi tiết Bài thi */}
        <div className="info-card">
          <p>
            <strong>Môn học:</strong> {subjectName}
          </p>
          <p>
            <strong>Đề thi:</strong> {title}
          </p>
          <p>
            <strong>Thời gian bắt đầu:</strong>{" "}
            {new Date(userExamDto.startTime).toLocaleString()}
          </p>
          <p>
            <strong>Thời gian kết thúc:</strong>{" "}
            {new Date(userExamDto.endTime).toLocaleString()}
          </p>
        </div>

        {/* Phần Thông tin User */}
        <div className="user-info-card">
          <p>
            <strong>User ID:</strong> {userExamDto.userId}
          </p>
          <p>
            <strong>Username:</strong> {userInfo?.username || "Đang tải..."}
          </p>
          <p>
            <strong>Họ tên:</strong> {userInfo?.fullName || "Đang tải..."}
          </p>
        </div>
      </div>

      <h3 className="mt-5 mb-3 question-section-header">Chi tiết đáp án</h3>

      <div className="full-page-scroll-content">
        {examQuestions.map((question, index) => {
          const userAnswerId = getUserAnswerForQuestion(question.questionId);
          return (
            <div key={question.questionId} className="mb-4 question-block">
              <h5 className="question-content-title">
                Câu {index + 1}: {question.content}
              </h5>
              <div className="answer-options-group">
                {question.answers.map((ans) => {
                  const isUserAnswer = ans.optionId === userAnswerId;
                  const isCorrect = ans.isCorrect;

                  let className = "answer-option";
                  if (isCorrect) className += " correct";
                  if (isUserAnswer && !isCorrect)
                    className += " incorrect-user-selected"; // Class mới
                  if (isUserAnswer && isCorrect)
                    className += " correct-user-selected"; // Class mới

                  return (
                    <div key={ans.optionId} className={className}>
                      <span className="answer-text">{ans.content}</span>
                      {isUserAnswer && isCorrect && (
                        <span className="answer-status success-icon">✔️</span>
                      )}
                      {isUserAnswer && !isCorrect && (
                        <span className="answer-status error-icon">❌</span>
                      )}
                      {!isUserAnswer && isCorrect && (
                        <span className="answer-status correct-info">
                          (Đúng)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
