import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageProvider";

export default function RevisionChap1() {
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // Lưu index đáp án đã chọn: { 0: 1, 1: 3 }
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Index câu hỏi hiện tại
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { chapterId, subjectId } = location.state || {}; // Lấy thêm info môn học nếu có
  const { texts } = useLanguage();

  // 1. Fetch dữ liệu
  useEffect(() => {
    const getAllQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await publicAxios.get(
          `/public/questions/chapter/${chapterId}`
        );
        if (response.data.responseCode === "404") {
          setError(response.data.responseMessage || "Không tìm thấy câu hỏi.");
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

    if (chapterId) {
      getAllQuestions();
    } else {
      setError("Không tìm thấy thông tin chương.");
      setIsLoading(false);
    }
  }, [chapterId]);

  // 2. Handlers
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    // Nếu đã chọn rồi thì không cho chọn lại (hoặc bỏ dòng này nếu muốn cho chọn lại)
    // if (selectedAnswers[questionIndex] !== undefined) return;

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

  // Lấy câu hỏi hiện tại
  const currentQuestion = questionAnswers[currentQuestionIndex];

  // Helper: Xác định trạng thái của Option (Chưa chọn, Chọn đúng, Chọn sai)
  const getOptionStyle = (qIndex, ansIndex, isCorrect) => {
    const userSelected = selectedAnswers[qIndex];

    // Chưa trả lời
    if (userSelected === undefined) {
      return "border-gray-200 hover:border-primary dark:border-gray-700 dark:hover:border-primary";
    }

    // Đã trả lời:
    // 1. Đây là đáp án ĐÚNG (luôn hiện xanh để user biết)
    if (isCorrect) {
      return "border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/30";
    }

    // 2. Đây là đáp án User CHỌN nhưng SAI
    if (userSelected === ansIndex && !isCorrect) {
      return "border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-900/30";
    }

    // 3. Các đáp án khác (mờ đi)
    return "border-gray-200 opacity-50 dark:border-gray-700";
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || totalQuestions === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background-light dark:bg-background-dark gap-4">
        <p className="text-red-500 text-lg">
          {error || "Không có câu hỏi nào."}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-screen bg-background-light dark:bg-background-dark text-[#111418] dark:text-gray-200">
      {/* MAIN CONTENT (LEFT/CENTER) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="mx-auto max-w-4xl">
          {/* Header Info & Progress */}
          <div className="mb-8 flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span
                className="text-gray-500 hover:text-primary dark:text-gray-400 cursor-pointer"
                onClick={() => navigate("/revision")}
              >
                Ôn tập
              </span>
              <span className="text-gray-500 dark:text-gray-400">/</span>
              <span className="text-gray-500 dark:text-gray-400">
                Chi tiết chương
              </span>
              <span className="text-gray-500 dark:text-gray-400">/</span>
              <span className="font-medium text-[#111418] dark:text-gray-200">
                Câu hỏi ôn tập
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <p className="text-base font-medium leading-normal">
                  Tiến độ ôn tập
                </p>
                <p className="text-sm font-medium leading-normal text-gray-500 dark:text-gray-400">
                  {answeredCount}/{totalQuestions} câu
                </p>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* QUESTION CARD */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#18212b] lg:p-8 min-h-[400px] flex flex-col justify-between">
            <div>
              <div className="mb-6 flex items-start justify-between gap-4">
                <h1 className="text-xl font-bold leading-tight tracking-[-0.015em] text-[#111418] dark:text-white">
                  Câu {currentQuestionIndex + 1}: {currentQuestion.content}
                </h1>
                {/* Nút bookmark giả lập (nếu cần) */}
                {/* <button className="text-gray-400 hover:text-yellow-500"><span className="material-symbols-outlined">bookmark_border</span></button> */}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      className={`relative flex cursor-pointer items-center rounded-lg border p-4 transition-all duration-200 ${containerStyle}`}
                    >
                      <div className="flex w-full items-center">
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          className={`form-radio size-5 text-primary focus:ring-primary/50 ${
                            isCorrect &&
                            selectedAnswers[currentQuestionIndex] !== undefined
                              ? "text-green-600"
                              : ""
                          }`}
                          checked={isSelected}
                          onChange={() =>
                            handleAnswerSelect(currentQuestionIndex, ansIndex)
                          }
                          // Có thể disable nếu muốn không cho chọn lại: disabled={selectedAnswers[currentQuestionIndex] !== undefined}
                        />
                        <span
                          className={`ml-4 font-medium ${
                            isSelected && !isCorrect
                              ? "text-red-700 dark:text-red-300"
                              : ""
                          } ${
                            isCorrect &&
                            selectedAnswers[currentQuestionIndex] !== undefined
                              ? "text-green-700 dark:text-green-300"
                              : ""
                          }`}
                        >
                          {String.fromCharCode(65 + ansIndex)}. {answer.content}
                        </span>
                      </div>

                      {/* Icon Feedback */}
                      {selectedAnswers[currentQuestionIndex] !== undefined &&
                        isCorrect && (
                          <span className="material-symbols-outlined ml-auto text-green-600 dark:text-green-400 animate-in zoom-in">
                            check_circle
                          </span>
                        )}
                      {selectedAnswers[currentQuestionIndex] !== undefined &&
                        isSelected &&
                        !isCorrect && (
                          <span className="material-symbols-outlined ml-auto text-red-600 dark:text-red-400 animate-in zoom-in">
                            cancel
                          </span>
                        )}
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
                className="flex h-11 min-w-[120px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-gray-100 px-5 text-sm font-bold text-[#111418] hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  arrow_back
                </span>
                <span>Câu trước</span>
              </button>

              {/* Nút ở giữa (Optional - Ví dụ nộp bài) */}
              {/* <button className="hidden sm:flex h-11 min-w-[84px] cursor-pointer items-center justify-center rounded-lg bg-blue-50 px-5 text-sm font-bold text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300">
                Xem gợi ý
              </button> */}

              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === totalQuestions - 1}
                className="flex h-11 min-w-[120px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-5 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* RIGHT SIDEBAR (QUESTION LIST) */}
      <aside className="hidden w-72 border-l border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#18212b] xl:block overflow-y-auto">
        <h3 className="mb-4 text-lg font-bold text-[#111418] dark:text-white">
          Danh sách câu hỏi
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {questionAnswers.map((_, index) => {
            const isAnswered = selectedAnswers[index] !== undefined;
            const isCurrent = currentQuestionIndex === index;

            // Logic màu sắc sidebar
            let btnClass =
              "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"; // Mặc định

            if (isCurrent) {
              btnClass =
                "bg-primary text-white border-primary ring-2 ring-primary/30"; // Đang chọn
            } else if (isAnswered) {
              btnClass = "bg-green-500 text-white border-green-500"; // Đã làm
            }

            return (
              <button
                key={index}
                onClick={() => handleJumpToQuestion(index)}
                className={`flex size-10 items-center justify-center rounded-lg font-medium text-sm transition-all duration-200 ${btnClass}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {/* Chú thích màu sắc */}
        <div className="mt-8 flex flex-col gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-primary"></div> Đang làm
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-green-500"></div> Đã trả lời
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600"></div>{" "}
            Chưa làm
          </div>
        </div>
      </aside>
    </div>
  );
}
