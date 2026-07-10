import React, { useState, useEffect, useCallback, useRef } from "react";
import { authAxios } from "../../../api/axiosConfig";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageProvider";
import { parseMarkdown } from "../../../utils/parseMarkdown";

const getFullImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiRoot = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace("/api/v1/", "")
    : "http://localhost:8080";
  return `${apiRoot}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function Exam() {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(null);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const endTimeRef = useRef(null);
  const handleSubmitRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const examId = location.state?.examId || params.examId;
  const subjectId = location.state?.subjectId || params.subjectId;
  const startTime = location.state?.startTime || new Date().toISOString();
  const { texts } = useLanguage();

  const handleSubmit = useCallback(async () => {
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

    const userAnswerDtos = Object.entries(selectedAnswers)
      .map(([questionIndex, answerIndex]) => {
        const question = questions[questionIndex];
        if (!question) return null;
        const answer = question.answers[answerIndex];
        return answer ? { questionId: question.questionId, answerId: answer.answerId || answer.optionId } : null;
      })
      .filter(Boolean);

    try {
      const response = await authAxios.post("user-exams", {
        // Không gửi score từ FE. Backend sẽ tự chấm lại dựa trên userAnswerDtos.
        userExamDto: { userId, examId, startTime, endTime },
        userAnswerDtos,
      });
      if (response.status === 200) {
        alert("Nộp bài thành công!");
        navigate(`/subjects/${subjectId}/exams/${examId}/result`, {
          state: {
            examId,
            subjectId,
            userExamId: response.data.data.userExamId,
            correctAnswers: correctAnswersCount,
            timeTaken: duration * 60 - (timeLeft || 0),
            totalQuestions: questions.length,
          },
        });
      }
    } catch (error) {
      console.error("Lỗi nộp bài:", error);
      alert(error.response?.status === 403 ? "Phiên đăng nhập hết hạn." : "Lỗi khi nộp bài.");
    }
  }, [questions, selectedAnswers, examId, subjectId, startTime, duration, timeLeft, navigate]);

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    const getAllQuestionsByExamId = async () => {
      try {
        setIsLoading(true);
        const response = await authAxios.get(`public/exams/${examId}`);
        const data = response.data.data;
        setSubjectName(data.subjectName);
        setTitle(data.title);
        setDuration(data.duration);
        endTimeRef.current = Date.now() + data.duration * 60 * 1000;
        setTimeLeft(data.duration * 60);
        setQuestions(data.questions || []);
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

  useEffect(() => {
    if (timeLeft === null || !endTimeRef.current) return;
    const timerId = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerId);
        handleSubmitRef.current?.();
      }
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise();
  }, [currentQuestionIndex, questions]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: answerIndex }));
  };

  const toggleMarkQuestion = () => {
    setMarkedQuestions((prev) => {
      const next = new Set(prev);
      next.has(currentQuestionIndex) ? next.delete(currentQuestionIndex) : next.add(currentQuestionIndex);
      return next;
    });
  };

  const safeTimeLeft = timeLeft ?? 0;
  const hours = Math.floor(safeTimeLeft / 3600);
  const minutes = Math.floor((safeTimeLeft % 3600) / 60);
  const seconds = safeTimeLeft % 60;

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Đang tải đề thi...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = questions.length ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light text-gray-900 transition-colors duration-300 dark:bg-background-dark dark:text-gray-100">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            <button onClick={() => navigate("/subjects")} className="font-bold uppercase tracking-wide hover:text-primary">Môn học</button>
            <span className="material-symbols-outlined text-base">chevron_right</span>
            <button
              onClick={() => subjectId ? navigate(`/subjects/${subjectId}`, { state: { subjectId } }) : navigate("/subjects")}
              className="max-w-[220px] truncate font-bold hover:text-primary"
            >
              {subjectName || "Môn học"}
            </button>
            <span className="material-symbols-outlined text-base">chevron_right</span>
            <span className="max-w-[260px] truncate font-bold text-gray-900 dark:text-white">{title || "Bài kiểm tra"}</span>
          </nav>

          <section className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="p-6 md:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                <span className="material-symbols-outlined text-base">quiz</span>
                Làm bài kiểm tra
              </div>
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">{title || "Bài kiểm tra"}</h1>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
                    Hoàn thành các câu hỏi trong thời gian quy định. Bạn có thể chuyển nhanh giữa các câu bằng bảng bên phải.
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 px-5 py-4 text-right text-primary">
                  <p className="text-xs font-bold uppercase tracking-wide">Tiến độ</p>
                  <p className="text-3xl font-black">{answeredCount}/{questions.length}</p>
                </div>
              </div>
              <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-12 gap-6">
            <aside className="col-span-12 space-y-6 lg:col-span-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-2 line-clamp-2 text-lg font-bold">{title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Môn: {subjectName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Số câu: {questions.length}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-4 text-center text-base font-semibold">{texts.conutDown || "Thời gian còn lại"}</h4>
                <div className="flex gap-3">
                  {[hours, minutes, seconds].map((val, idx) => (
                    <div key={idx} className="flex grow basis-0 flex-col items-stretch gap-2">
                      <div className="flex h-16 grow items-center justify-center rounded-xl bg-primary/10 px-3 text-primary">
                        <p className="text-2xl font-bold tracking-[-0.015em]">{val.toString().padStart(2, "0")}</p>
                      </div>
                      <p className="text-center text-xs text-gray-500 dark:text-gray-400">{idx === 0 ? "Giờ" : idx === 1 ? "Phút" : "Giây"}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <p className="text-base font-medium">Tiến độ</p>
                <div className="mt-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Đã trả lời: {answeredCount}/{questions.length} câu</p>
              </div>
            </aside>

            <section className="col-span-12 flex min-h-[520px] flex-col rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-6">
              <div className="flex-grow p-6">
                <h3 className="pb-2 text-left text-xl font-bold leading-tight text-primary">Câu {currentQuestionIndex + 1}</h3>
                <div className="pb-6 pt-1 text-base font-normal leading-relaxed text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: parseMarkdown(currentQuestion?.content) }} />
                {currentQuestion?.imageUrl && (
                  <div className="my-4 text-center">
                    <img src={getFullImageUrl(currentQuestion.imageUrl)} alt="Minh họa câu hỏi" className="mx-auto max-h-64 max-w-full rounded-lg border border-gray-200 shadow-sm dark:border-gray-700" />
                  </div>
                )}
                <div className="space-y-4">
                  {currentQuestion?.answers?.map((answer, index) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === index;
                    return (
                      <label key={answer.optionId || index} className={`flex cursor-pointer items-start rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${isSelected ? "border-primary bg-primary/10 dark:bg-primary/20" : "border-gray-200 hover:border-primary/50 dark:border-gray-600"}`}>
                        <input type="radio" name={`question-${currentQuestionIndex}`} className="mt-0.5 h-5 w-5 flex-shrink-0 border-gray-300 text-primary focus:ring-primary" checked={isSelected} onChange={() => handleAnswerSelect(index)} />
                        <span className={`ml-4 text-base font-medium ${isSelected ? "text-primary dark:text-white" : ""}`} dangerouslySetInnerHTML={{ __html: parseMarkdown(answer.content) }} />
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 p-4 dark:border-gray-700">
                <button onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-100 px-5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                  <span className="material-symbols-outlined text-base">arrow_back</span><span className="hidden sm:inline">Câu trước</span>
                </button>
                <button onClick={toggleMarkQuestion} className="hidden h-11 items-center justify-center gap-2 rounded-xl bg-yellow-500/10 px-4 text-sm font-bold text-yellow-600 transition-colors hover:bg-yellow-500/20 sm:flex">
                  <span className="material-symbols-outlined text-base">bookmark</span>Đánh dấu
                </button>
                <button onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))} disabled={currentQuestionIndex === questions.length - 1} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
                  <span className="hidden sm:inline">Câu tiếp theo</span><span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </section>

            <aside className="col-span-12 lg:col-span-3">
              <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-950 dark:text-white"><span className="material-symbols-outlined">grid_view</span>{texts.table || "Danh sách câu hỏi"}</h4>
                <div className="mb-6 grid max-h-[300px] grid-cols-5 gap-2 overflow-y-auto p-2 pr-1">
                  {questions.map((_, idx) => {
                    const isCurrent = currentQuestionIndex === idx;
                    const isAnswered = selectedAnswers[idx] !== undefined;
                    const isMarked = markedQuestions.has(idx);
                    let bgClass = "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400";
                    if (isCurrent) bgClass = "border-primary bg-primary text-white ring-2 ring-primary/20";
                    else if (isAnswered) bgClass = "border-green-600 bg-green-500 text-white";
                    return <button key={idx} onClick={() => setCurrentQuestionIndex(idx)} className={`relative flex size-9 items-center justify-center rounded-lg text-sm font-bold transition-all ${bgClass}`}>{idx + 1}{isMarked && <span className="material-symbols-outlined absolute -right-1 -top-1 rounded-full bg-white text-[14px] text-yellow-500 dark:bg-gray-800" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>}</button>;
                  })}
                </div>
                <div className="mb-6 space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                  <div className="flex items-center gap-3"><div className="size-4 rounded-sm bg-primary" /><span>Câu hiện tại</span></div>
                  <div className="flex items-center gap-3"><div className="size-4 rounded-sm bg-green-500" /><span>Đã trả lời</span></div>
                  <div className="flex items-center gap-3"><div className="size-4 rounded-sm border border-gray-400 bg-gray-200 dark:bg-white/10" /><span>Chưa trả lời</span></div>
                </div>
                <button onClick={() => { if (window.confirm("Bạn có chắc chắn muốn nộp bài không?")) handleSubmit(); }} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 text-base font-bold text-white shadow-md transition-all hover:bg-green-700 hover:shadow-lg active:scale-95">
                  <span className="material-symbols-outlined">check_circle</span><span>{texts.submit || "Nộp bài"}</span>
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
