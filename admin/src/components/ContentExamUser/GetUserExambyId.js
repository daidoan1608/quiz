import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { authAxios } from '../../Api/axiosConfig';
import './GetUserExambyId.css';

export default function GetUserExambyId() {
  const { userExamId } = useParams();
  const [examDetail, setExamDetail] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamDetail();
  }, []);

  const fetchExamDetail = async () => {
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
      console.error('Lỗi khi lấy chi tiết bài thi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (!examDetail) return <div>Không tìm thấy dữ liệu bài thi.</div>;

  const { subjectName, title, userExamDto, userAnswerDtos } = examDetail;

  const getUserAnswerForQuestion = (questionId) => {
    return userAnswerDtos.find((ans) => ans.questionId === questionId)?.answerId;
  };

  return (
    <div className="">
      <h2 className="mb-3">Chi tiết bài thi người dùng</h2>

      <div className="mb-4">
        <p><strong>Môn học:</strong> {subjectName}</p>
        <p><strong>Đề thi:</strong> {title}</p>
        <p><strong>Thời gian bắt đầu:</strong> {new Date(userExamDto.startTime).toLocaleString()}</p>
        <p><strong>Thời gian kết thúc:</strong> {new Date(userExamDto.endTime).toLocaleString()}</p>
        <p><strong>Điểm:</strong> {userExamDto.score}</p>
        <p><strong>User ID:</strong> {userExamDto.userId}</p>
        <p><strong>Username:</strong> {userInfo?.username || 'Đang tải...'}</p>
        <p><strong>Họ tên:</strong> {userInfo?.fullName || 'Đang tải...'}</p>
      </div>

      <div className="question-list-scroll">
        {examQuestions.map((question, index) => {
          const userAnswerId = getUserAnswerForQuestion(question.questionId);
          return (
            <div key={question.questionId} className="mb-4 question-block">
              <h5>Câu {index + 1}: {question.content}</h5>
              {question.answers.map((ans) => {
                const isUserAnswer = ans.optionId === userAnswerId;
                const isCorrect = ans.isCorrect;

                let className = 'answer-option';
                if (isCorrect) className += ' correct'; // luôn tô xanh đáp án đúng
                if (isUserAnswer && !isCorrect) className += ' incorrect'; // tô đỏ đáp án sai user chọn

                return (
                  <div key={ans.optionId} className={className}>
                    {ans.content}
                    {isUserAnswer && isCorrect && <span className="ml-2">✔️</span>}
                    {isUserAnswer && !isCorrect && <span className="ml-2">❌</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
