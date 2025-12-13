import React, { useState, useEffect, useCallback } from "react";
import { authAxios } from "../../../api/axiosConfig";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageProvider";

export default function Exam() {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState(new Set()); // State để đánh dấu câu hỏi (Flag)

  // --- STATE QUẢN LÝ THỜI GIAN & UI ---
  const [timeLeft, setTimeLeft] = useState(null);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Index câu hỏi hiện tại
  const [isLoading, setIsLoading] = useState(true);

  // --- HOOKS ---
  const navigate = useNavigate();
  const location = useLocation();
  const { examId, startTime } = location.state || {};
  const { texts } = useLanguage();

  // --- 1. NỘP BÀI (SUBMIT LOGIC) ---
  const handleSubmit = useCallback(async () => {
    // Logic tính điểm và format dữ liệu
    const userId = localStorage.getItem("userId");
    const endTime = new Date().toISOString();

    const correctAnswersCount = questions.reduce((count, question, index) => {
      const userAnswerIndex = selectedAnswers[index];
      if (userAnswerIndex !== undefined) {
        const selectedAnswer = question.answers[userAnswerIndex];
        return selectedAnswer.isCorrect ? count + 1 : count;
      }
      return count;
    }, 0);

    const score = (correctAnswersCount / questions.length) * 100;

    const userAnswerDtos = Object.entries(selectedAnswers)
      .map(([questionIndex, answerIndex]) => {
        const question = questions[questionIndex];
        if (!question) return null;
        const answer = question.answers[answerIndex];
        return answer
          ? {
              questionId: question.questionId,
              answerId: answer.answerId || answer.optionId,
            }
          : null;
      })
      .filter(Boolean);

    const payload = {
      userExamDto: { userId, examId, startTime, endTime, score },
      userAnswerDtos,
    };

    try {
      const response = await authAxios.post("user/userexams", payload);
      if (response.status === 200) {
        alert("Nộp bài thành công!");
        navigate("/result", {
          state: {
            examId,
            userExamId: response.data.data.userExamId,
            correctAnswers: correctAnswersCount,
            timeTaken: duration * 60 - timeLeft,
            totalQuestions: questions.length,
          },
        });
      }
    } catch (error) {
      console.error("Lỗi nộp bài:", error);
      alert(
        error.response?.status === 403
          ? "Phiên đăng nhập hết hạn."
          : "Lỗi khi nộp bài."
      );
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

  // --- 2. FETCH DỮ LIỆU ---
  useEffect(() => {
    const getAllQuestionsByExamId = async () => {
      try {
        setIsLoading(true);
        const response = await authAxios.get(`public/exams/${examId}`);
        const data = response.data.data;

        setSubjectName(data.subjectName);
        setTitle(data.title);
        setDuration(data.duration);
        setTimeLeft(data.duration * 60);
        setQuestions(data.questions);
      } catch (error) {
        console.error("Lỗi tải đề:", error);
        alert("Không thể tải đề thi.");
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };
    if (examId) getAllQuestionsByExamId();
  }, [examId, navigate]);

  // --- 3. ĐẾM NGƯỢC THỜI GIAN ---
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft === 0) {
      handleSubmit();
      return;
    }
    const timerId = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, handleSubmit]);

  // --- 4. CÁC HÀM XỬ LÝ SỰ KIỆN ---
  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answerIndex,
    }));
  };

  const toggleMarkQuestion = () => {
    setMarkedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionIndex)) newSet.delete(currentQuestionIndex);
      else newSet.add(currentQuestionIndex);
      return newSet;
    });
  };

  // --- HELPERS FORMAT THỜI GIAN ---
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  // --- RENDER ---
  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        Đang tải đề thi...
      </div>
    );

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent =
    (Object.keys(selectedAnswers).length / questions.length) * 100;

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light dark:bg-background-dark text-[#111418] dark:text-gray-200">
      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 lg:p-8">
        <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6">
          {/* --- LEFT COLUMN: INFO & TIMER --- */}
          <aside className="col-span-12 lg:col-span-3 space-y-6">
            {/* Exam Info */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-bold mb-2 line-clamp-2">{title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Môn: {subjectName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Số câu: {questions.length}
              </p>
            </div>

            {/* Timer */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="text-base font-semibold mb-4 text-center">
                {texts.conutDown || "Thời gian còn lại"}
              </h4>
              <div className="flex gap-3">
                {[hours, minutes, seconds].map((val, idx) => (
                  <div
                    key={idx}
                    className="flex grow basis-0 flex-col items-stretch gap-2"
                  >
                    <div className="flex h-16 grow items-center justify-center rounded-lg px-3 bg-background-light dark:bg-white/10">
                      <p className="text-2xl font-bold tracking-[-0.015em]">
                        {val.toString().padStart(2, "0")}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {idx === 0 ? "Giờ" : idx === 1 ? "Phút" : "Giây"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <p className="text-base font-medium">Tiến độ</p>
                </div>
                <div className="rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Đã trả lời: {Object.keys(selectedAnswers).length}/
                  {questions.length} câu
                </p>
              </div>
            </div>
          </aside>

          {/* --- MIDDLE COLUMN: QUESTION AREA --- */}
          <section className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col min-h-[500px]">
            <div className="p-6 flex-grow">
              {/* Question Content */}
              <h3 className="text-xl font-bold leading-tight text-left pb-2 text-primary">
                Câu {currentQuestionIndex + 1}
              </h3>
              <p className="text-base font-normal leading-relaxed pb-6 pt-1 text-gray-800 dark:text-gray-200">
                {currentQuestion?.content}
              </p>

              {/* Answers Options */}
              <div className="space-y-4">
                {currentQuestion?.answers?.map((answer, index) => {
                  const isSelected =
                    selectedAnswers[currentQuestionIndex] === index;
                  return (
                    <label
                      key={answer.optionId || index}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                        ${
                          isSelected
                            ? "border-primary bg-primary/10 dark:bg-primary/20"
                            : "border-gray-200 dark:border-gray-600 hover:border-primary/50"
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        className="h-5 w-5 border-gray-300 text-primary focus:ring-primary"
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(index)}
                      />
                      <span
                        className={`ml-4 text-base font-medium ${
                          isSelected ? "text-primary dark:text-white" : ""
                        }`}
                      >
                        {answer.content}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Action Bar (Footer) */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 text-sm font-bold bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">
                    arrow_back
                  </span>
                  <span className="hidden sm:inline">Câu trước</span>
                </button>

                <button
                  onClick={() =>
                    setCurrentQuestionIndex((prev) =>
                      Math.min(questions.length - 1, prev + 1)
                    )
                  }
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <span className="hidden sm:inline">Câu tiếp theo</span>
                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                </button>
            </div>
          </section>

          {/* --- RIGHT COLUMN: QUESTION PALETTE --- */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 sticky top-24">
              <h4 className="text-base font-semibold mb-4">
                {texts.table || "Danh sách câu hỏi"}
              </h4>

              {/* Grid Numbers */}
              <div className="p-2 grid grid-cols-5 gap-2 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {questions.map((_, idx) => {
                  const isCurrent = currentQuestionIndex === idx;
                  const isAnswered = selectedAnswers[idx] !== undefined;
                  const isMarked = markedQuestions.has(idx);

                  let bgClass =
                    "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-transparent"; // Default

                  if (isCurrent) {
                    bgClass =
                      "bg-primary text-white ring-2 ring-offset-2 ring-primary dark:ring-offset-gray-900";
                  } else if (isAnswered) {
                    bgClass = "bg-green-500 text-white border-green-600";
                  }

                  // Priority: Current > Answered > Default. Mark overlays using absolute icon.

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`relative flex size-9 items-center justify-center rounded-lg text-sm font-bold transition-all ${bgClass}`}
                    >
                      {idx + 1}
                      {isMarked && (
                        <span
                          className="material-symbols-outlined absolute -top-1 -right-1 text-[14px] text-yellow-500 bg-white dark:bg-gray-800 rounded-full"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          bookmark
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legends (Chú thích) */}
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-6 border-t border-gray-100 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-3">
                  <div className="size-4 rounded-sm bg-primary"></div>
                  <span>Câu hiện tại</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-4 rounded-sm bg-green-500"></div>
                  <span>Đã trả lời</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-4 rounded-sm bg-gray-200 dark:bg-white/10 border border-gray-400"></div>
                  <span>Chưa trả lời</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={() => {
                  if (window.confirm("Bạn có chắc chắn muốn nộp bài không?")) {
                    handleSubmit();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 rounded-lg h-11 px-6 text-base font-bold bg-green-600 text-white hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20"
              >
                <span className="material-symbols-outlined">check_circle</span>
                <span>{texts.submit || "Nộp bài"}</span>
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
