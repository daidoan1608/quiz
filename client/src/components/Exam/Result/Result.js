import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authAxios } from "../../../api/axiosConfig";
import { useLanguage } from "../../Context/LanguageProvider";

export default function ResultExam() {
  // --- STATE ---
  const [examData, setExamData] = useState(null);
  const [userAnswers, setUserAnswers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- HOOKS ---
  const location = useLocation();
  const navigate = useNavigate();
  const { examId, userExamId, correctAnswers, totalQuestions } =
    location.state || {};
  const { texts } = useLanguage();

  // --- 1. FETCH DỮ LIỆU ---
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
        setError(error.message || "Lỗi khi tải dữ liệu kết quả.");
      } finally {
        setLoading(false);
      }
    };

    if (examId && userExamId) fetchData();
    else setError("Thiếu thông tin bài kiểm tra.");
  }, [examId, userExamId]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500 bg-background-light dark:bg-background-dark">
        {error}
      </div>
    );

  // --- 2. TÍNH TOÁN CHỈ SỐ ---
  const score = userAnswers.userExamDto.score; // Điểm số
  const accuracy =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;
  const wrongAnswers = totalQuestions - correctAnswers;

  // Tính toán SVG Chart (Chu vi ~ 100)
  // Logic: Vẽ vòng tròn Đúng (Xanh) -> Sai (Đỏ) -> Còn lại là nền
  const correctStroke = accuracy;
  const wrongStroke = (wrongAnswers / totalQuestions) * 100;

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light dark:bg-background-dark text-[#111418] dark:text-gray-200">
      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col gap-8">
          {/* 1. Header Kết quả */}
          <div className="flex flex-wrap justify-between gap-4 items-center">
            <div className="flex flex-col gap-2">
              <p className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black tracking-[-0.033em]">
                Kết quả: {examData.title}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">
                {score >= 5
                  ? "Chúc mừng! Bạn đã hoàn thành bài kiểm tra."
                  : "Kết quả chưa tốt, hãy cố gắng hơn lần sau nhé!"}
              </p>
            </div>
          </div>

          {/* 2. Thống kê nhanh (Grid 3 cột) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800">
              <p className="text-gray-800 dark:text-gray-300 text-base font-medium leading-normal">
                Điểm số
              </p>
              <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
                {typeof score === "number" ? score.toFixed(1) : score}/100
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800">
              <p className="text-gray-800 dark:text-gray-300 text-base font-medium leading-normal">
                Tỷ lệ chính xác
              </p>
              <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
                {accuracy}%
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800">
              <p className="text-gray-800 dark:text-gray-300 text-base font-medium leading-normal">
                Trạng thái
              </p>
              <p
                className={`tracking-light text-3xl font-bold leading-tight ${
                  score >= 50
                    ? "text-green-600 dark:text-green-500"
                    : "text-red-600 dark:text-red-500"
                }`}
              >
                {score >= 50 ? "Đạt" : "Chưa đạt"}
              </p>
            </div>
          </div>

          {/* 3. Phân tích hiệu suất (Biểu đồ tròn) */}
          <div className="flex flex-col gap-6">
            <h2 className="text-gray-900 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]">
              Phân tích hiệu suất
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800">
                <p className="text-gray-800 dark:text-gray-300 text-base font-medium leading-normal">
                  Tỷ lệ câu trả lời
                </p>
                <div className="flex items-center gap-6">
                  {/* SVG Chart */}
                  <div className="relative size-32">
                    <svg className="size-full" viewBox="0 0 36 36">
                      {/* Nền (Màu xám/đỏ nhạt cho phần còn lại) */}
                      <circle
                        className="stroke-current text-gray-200 dark:text-gray-700"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="15.9154943092"
                        strokeWidth="3"
                      ></circle>
                      {/* Phần Đúng (Xanh) */}
                      <circle
                        className="stroke-current text-green-500 transition-all duration-1000 ease-out"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="15.9154943092"
                        strokeWidth="3"
                        strokeDasharray={`${correctStroke}, 100`}
                      ></circle>
                      {/* Phần Sai (Đỏ) - Offset để nối tiếp */}
                      <circle
                        className="stroke-current text-red-500 transition-all duration-1000 ease-out"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="15.9154943092"
                        strokeWidth="3"
                        strokeDasharray={`${wrongStroke}, 100`}
                        strokeDashoffset={-correctStroke}
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {correctAnswers}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        /{totalQuestions} câu
                      </span>
                    </div>
                  </div>

                  {/* Chú thích */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {correctAnswers} Đúng
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {wrongAnswers} Sai
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => {
                /* Logic ôn tập câu sai */
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-base">
                school
              </span>
              Ôn tập câu sai
            </button>
            <button
              onClick={() => navigate(0)} // Reload
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-base">
                refresh
              </span>
              Làm lại bài kiểm tra
            </button>
            <button
              onClick={() => navigate("/exams")}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-base">
                arrow_back
              </span>
              Quay về danh sách
            </button>
          </div>

          {/* 5. Chi tiết câu trả lời */}
          <div className="flex flex-col gap-6">
            <h2 className="text-gray-900 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]">
              Chi tiết câu trả lời
            </h2>
            <div className="flex flex-col gap-4">
              {examData.questions.map((question, index) => {
                // Logic tìm đáp án
                const userAnswerObj = userAnswers.userAnswerDtos?.find(
                  (u) => u.questionId === question.questionId
                );
                const userAnswerId = userAnswerObj?.answerId;

                const correctAnswer = question.answers.find((a) => a.isCorrect);
                const userSelectedAnswer = question.answers.find(
                  (a) => (a.optionId || a.answerId) === userAnswerId
                );
                const isCorrect = userSelectedAnswer?.isCorrect;

                return (
                  <div
                    key={question.questionId}
                    className="rounded-xl p-5 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex flex-col gap-4">
                      {/* Tiêu đề câu hỏi & Badge */}
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-gray-800 dark:text-gray-200 font-semibold">
                          Câu {index + 1}: {question.content}
                        </p>
                        <div
                          className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full shrink-0
                            ${
                              isCorrect
                                ? "text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/50"
                                : "text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-900/50"
                            }`}
                        >
                          <span className="material-symbols-outlined !text-base">
                            {isCorrect ? "check_circle" : "cancel"}
                          </span>
                          <span>{isCorrect ? "Đúng" : "Sai"}</span>
                        </div>
                      </div>

                      {/* Grid Đáp án (2 cột) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-2">
                        {/* Cột 1: Đáp án của bạn */}
                        <div
                          className={`flex flex-col gap-1 p-3 rounded-lg border relative
                            ${
                              isCorrect
                                ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
                                : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800"
                            }`}
                        >
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Đáp án của bạn
                          </span>
                          <span
                            className={`font-semibold ${
                              isCorrect
                                ? "text-gray-800 dark:text-gray-200"
                                : "text-red-800 dark:text-red-300"
                            }`}
                          >
                            {userSelectedAnswer
                              ? userSelectedAnswer.content
                              : "Chưa chọn đáp án"}
                          </span>
                        </div>

                        {/* Cột 2: Đáp án đúng (Luôn hiện để so sánh) */}
                        <div className="flex flex-col gap-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Đáp án đúng
                          </span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {correctAnswer?.content}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
