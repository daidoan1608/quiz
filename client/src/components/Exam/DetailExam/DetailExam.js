import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { authAxios } from "../../../api/axiosConfig";
import "./DetailExam.css";

export default function DetailExam() {
  const [examData, setExamData] = useState(null);
  const [userAnswers, setUserAnswers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { examId, userExamId } = location.state || {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examResponse, userAnswersResponse] = await Promise.all([
          authAxios.get(`public/exams/${examId}`),
          authAxios.get(`user/userexams/${userExamId}`),
        ]);
        setExamData(examResponse.data.data);
        setUserAnswers(userAnswersResponse.data.data);
      } catch (error) {
        setError(error.message || "Error fetching exam data");
      } finally {
        setLoading(false);
      }
    };

    if (examId && userExamId) fetchData();
    else setError("Missing exam or user exam ID");
  }, [examId, userExamId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!examData || !userAnswers) return <div>No data available</div>;

  const renderQuestions = () => {
    return examData.questions.map((question, questionIndex) => {
      const userAnswer = userAnswers.userAnswerDtos?.find(
        (answer) => answer.questionId === question.questionId
      );
      return (
        <div key={question.questionId} className="mb-4">
          <h3 className="font-bold">
            Câu {questionIndex + 1}: {question.content}
          </h3>
          <div className="flex flex-col">
            {question.answers.map((answer) => {
              const isCorrect = answer.isCorrect;
              const isUserAnswer = userAnswer?.answerId === answer.optionId;

              return (
                <div
                  key={answer.optionId}
                  className={`p-2 mb-2 border rounded-lg 
                                    ${
                                      isCorrect
                                        ? "correct-answer"
                                        : isUserAnswer
                                        ? "incorrect-user-answer"
                                        : "default-answer"
                                    }`}
                >
                  <span
                    className={`${isCorrect ? "text-black" : "text-black"}`}
                  >
                    {answer.content}
                  </span>
                  {/* Nếu người dùng chọn đúng, thêm dấu tích xanh */}
                  {isUserAnswer && isCorrect && (
                    <span className="correct-icon ml-2">✔️</span>
                  )}
                  {/* Nếu người dùng chọn sai, thêm dấu X đỏ */}
                  {isUserAnswer && !isCorrect && (
                    <span className="incorrect-icon ml-2">❌</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <div className="p-4">
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg border mb-4">
          <h2 className="text-xl font-bold mb-4">Môn: {examData.subjectName}</h2>
          <h2 className="text-xl font-bold mb-4">{examData.title}</h2>
          <h2 className="text-xl font-bold mb-4">Điểm: {userAnswers.userExamDto.score}</h2>
          <h2 className="text-xl font-bold mb-4">
            Ngày làm bài: {formatDate(userAnswers.userExamDto.startTime)}
          </h2> 
        </div>
        {renderQuestions()}
      </div>
    </>
  );
}

function formatDate(startTime) {
  // Chuyển đổi thành đối tượng Date
  const date = new Date(startTime);

  // Lấy ngày, tháng, năm
  const day = date.getDate();  // Ngày
  const month = date.getMonth() + 1;  // Tháng (cộng 1 vì getMonth() trả về từ 0 đến 11)
  const year = date.getFullYear();  // Năm

  // Trả về chuỗi ngày/tháng/năm
  return `${day}-${month}-${year}`;
}