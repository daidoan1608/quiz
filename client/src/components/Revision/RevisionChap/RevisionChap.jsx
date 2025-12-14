import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageProvider";

export default function RevisionChap1() {
  // --- STATE ---
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- HOOKS ---
  const location = useLocation();
  const navigate = useNavigate();
  const { texts } = useLanguage();

  // Lấy data truyền từ trang trước (cần đảm bảo trang trước truyền đủ tên)
  const { chapterId, subjectId, subjectName, chapterName } =
    location.state || {};

  // 1. Fetch dữ liệu
  useEffect(() => {
    const getAllQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Gọi API
        const response = await publicAxios.get(
          `/public/questions/chapter/${chapterId}`
        );

        if (response.data.status === "success" && response.data.data) {
          // Kiểm tra nếu mảng rỗng
          if (response.data.data.length === 0) {
            setQuestionAnswers([]); // Rỗng nhưng không lỗi
          } else {
            setQuestionAnswers(response.data.data);
          }
        } else {
          // Trường hợp API trả về lỗi logic (vd: 404 trong body)
          setError(response.data.message || "Không tìm thấy dữ liệu câu hỏi.");
          setQuestionAnswers([]);
        }
      } catch (error) {
        console.error("Lỗi tải câu hỏi:", error);
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
        setQuestionAnswers([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (chapterId) {
      getAllQuestions();
    } else {
      setError("Thiếu thông tin chương (ID).");
      setIsLoading(false);
    }
  }, [chapterId]);

  // 2. Handlers
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questionAnswers.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // 3. Tính toán tiến độ
  const totalQuestions = questionAnswers.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const currentQuestion = questionAnswers[currentQuestionIndex];

  // Helper styles
  const getOptionStyle = (qIndex, ansIndex, isCorrect) => {
    const userSelected = selectedAnswers[qIndex];
    if (userSelected === undefined)
      return "border-gray-200 hover:border-primary dark:border-gray-700 dark:hover:border-primary";
    if (isCorrect)
      return "border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/30";
    if (userSelected === ansIndex && !isCorrect)
      return "border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-900/30";
    return "border-gray-200 opacity-50 dark:border-gray-700";
  };

  // --- RENDER LOADING ---
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
          <p className="text-gray-500 font-medium">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  // --- RENDER ERROR / EMPTY STATE ---
  if (error || totalQuestions === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-4 text-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-md w-full">
          {/* Ảnh minh họa Empty State */}
          <img
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3J5Z3J5Z3J5Z3J5Z3J5Z3J5Z3J5Z3J5Z3J5Z3J5Z3J5ZyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/WXB88TeARFVvi/giphy.gif"
            alt="Empty"
            className="w-32 h-32 object-contain mx-auto mb-4 opacity-80"
          />

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {error ? "Đã có lỗi xảy ra" : "Chưa có dữ liệu"}
          </h3>

          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error ||
              "Hiện tại chưa có câu hỏi ôn tập nào cho chương này. Vui lòng quay lại sau."}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-bold transition-colors"
          >
            Quay lại danh sách chương
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN CONTENT ---
  return (
    <div className="flex flex-1 min-h-screen bg-background-light dark:bg-background-dark text-[#111418] dark:text-gray-200">
      {/* MAIN CONTENT (LEFT/CENTER) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="mx-auto max-w-4xl">
          {/* 1. Header & Breadcrumbs (Đã sửa theo yêu cầu) */}
          <div className="mb-8 flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 cursor-pointer transition-colors"
                onClick={() => navigate("/")}
              >
                Trang chủ
              </span>
              <span className="text-gray-400">/</span>
              <span
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 cursor-pointer transition-colors"
                onClick={() => navigate("/revision")}
              >
                Ôn tập
              </span>
              <span className="text-gray-400">/</span>
              {/* Link quay lại môn học */}
              <span
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 cursor-pointer transition-colors truncate max-w-[150px]"
                onClick={() =>
                  navigate("/listChap", { state: { subjectId: subjectId } })
                }
              >
                {subjectName || "Môn học"}
              </span>
              <span className="text-gray-400">/</span>
              <span className="font-bold text-[#111418] dark:text-white truncate max-w-[200px]">
                {chapterName || "Chương"}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-black text-[#111418] dark:text-white">
                    Câu hỏi ôn tập
                  </h1>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {answeredCount}/{totalQuestions}
                  </p>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 2. QUESTION CARD */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#18212b] lg:p-8 min-h-[400px] flex flex-col justify-between transition-all">
            <div>
              <div className="mb-6 flex items-start gap-4">
                <div className="flex-shrink-0 size-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm dark:bg-blue-900/30 dark:text-blue-300">
                  {currentQuestionIndex + 1}
                </div>
                <h2 className="text-lg font-bold leading-snug text-[#111418] dark:text-white">
                  {currentQuestion.content}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.answers?.map((answer, ansIndex) => {
                  const isCorrect = answer.isCorrect;
                  const isSelected =
                    selectedAnswers[currentQuestionIndex] === ansIndex;
                  const containerStyle = getOptionStyle(
                    currentQuestionIndex,
                    ansIndex,
                    isCorrect
                  );

                  return (
                    <label
                      key={answer.optionId || ansIndex}
                      className={`relative flex cursor-pointer items-center rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${containerStyle}`}
                    >
                      <div className="flex w-full items-center">
                        <div
                          className={`flex items-center justify-center size-6 rounded-full border border-gray-300 mr-4 transition-colors
                            ${
                              isSelected ||
                              (selectedAnswers[currentQuestionIndex] !==
                                undefined &&
                                isCorrect)
                                ? "border-transparent"
                                : "bg-white"
                            }
                        `}
                        >
                          {/* Custom Radio Circle Logic */}
                          {isSelected && !isCorrect && (
                            <span className="material-symbols-outlined text-red-500 text-xl">
                              cancel
                            </span>
                          )}
                          {selectedAnswers[currentQuestionIndex] !==
                            undefined &&
                            isCorrect && (
                              <span className="material-symbols-outlined text-green-500 text-xl">
                                check_circle
                              </span>
                            )}
                          {selectedAnswers[currentQuestionIndex] ===
                            undefined && (
                            <div className="size-3 rounded-full bg-gray-200"></div>
                          )}
                        </div>

                        {/* Hidden Radio Input for semantic */}
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          className="hidden"
                          checked={isSelected}
                          onChange={() =>
                            handleAnswerSelect(currentQuestionIndex, ansIndex)
                          }
                          disabled={
                            selectedAnswers[currentQuestionIndex] !== undefined
                          } // Disable nếu đã chọn
                        />

                        <span
                          className={`font-medium text-base ${
                            isSelected && !isCorrect
                              ? "text-red-700 dark:text-red-300"
                              : ""
                          } ${
                            isCorrect &&
                            selectedAnswers[currentQuestionIndex] !== undefined
                              ? "text-green-700 dark:text-green-300"
                              : "text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {answer.content}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="flex h-11 px-6 items-center gap-2 rounded-lg bg-gray-100 font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  arrow_back
                </span>
                <span>Câu trước</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === totalQuestions - 1}
                className="flex h-11 px-6 items-center gap-2 rounded-lg bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
              >
                <span>Câu tiếp</span>
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR (QUESTION LIST) - Giữ nguyên logic cũ nhưng style lại chút */}
      <aside className="hidden w-80 border-l border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#18212b] xl:block overflow-y-auto">
        <h3 className="mb-4 text-lg font-bold text-[#111418] dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined">grid_view</span>
          Danh sách câu hỏi
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {questionAnswers.map((_, index) => {
            const isAnswered = selectedAnswers[index] !== undefined;
            const isCurrent = currentQuestionIndex === index;

            let btnClass =
              "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400";
            if (isCurrent)
              btnClass =
                "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200 dark:ring-blue-900";
            else if (isAnswered)
              btnClass =
                "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";

            return (
              <button
                key={index}
                onClick={() => handleJumpToQuestion(index)}
                className={`flex aspect-square items-center justify-center rounded-lg font-bold text-sm transition-all duration-200 ${btnClass}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
          <h4 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">
            Chú thích
          </h4>
          <div className="flex flex-col gap-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-blue-600"></div> Đang làm
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-green-100 border border-green-300"></div>{" "}
              Đã trả lời
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-gray-200 border border-gray-300"></div>{" "}
              Chưa làm
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
