import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import { parseMarkdown } from "../../../utils/parseMarkdown";
import { typesetMath } from "../../../utils/typesetMath";

const getFullImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiRoot = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace("/api/v1/", "")
    : "http://localhost:8080";
  return `${apiRoot}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function RevisionChap1() {
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [confirmedAnswers, setConfirmedAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { chapterId, subjectId, subjectName, chapterName } = location.state || {};

  useEffect(() => {
    typesetMath();
  }, [currentQuestionIndex, questionAnswers, selectedAnswers, confirmedAnswers]);

  useEffect(() => {
    const getAllQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await publicAxios.get(`/public/questions/chapter/${chapterId}`);
        if (response.data.status === "success" && response.data.data) {
          setQuestionAnswers(response.data.data || []);
        } else {
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

    if (chapterId) getAllQuestions();
    else {
      setError("Thiếu thông tin chương (ID).");
      setIsLoading(false);
    }
  }, [chapterId]);

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    const q = questionAnswers[questionIndex];
    if (!q) return;
    const isMultiple = q.questionType === "MULTIPLE_CHOICE";

    if (isMultiple) {
      if (confirmedAnswers[questionIndex]) return;
      setSelectedAnswers((prev) => {
        const currentSelection = prev[questionIndex] || [];
        const newSelection = currentSelection.includes(answerIndex)
          ? currentSelection.filter((idx) => idx !== answerIndex)
          : [...currentSelection, answerIndex];
        return { ...prev, [questionIndex]: newSelection };
      });
    } else {
      if (selectedAnswers[questionIndex] !== undefined) return;
      setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questionAnswers.length - 1) setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleJumpToQuestion = (index) => setCurrentQuestionIndex(index);

  const totalQuestions = questionAnswers.length;
  const answeredCount = Object.keys(selectedAnswers).filter((key) => {
    const q = questionAnswers[Number(key)];
    if (q?.questionType === "MULTIPLE_CHOICE") return confirmedAnswers[key] === true;
    return selectedAnswers[key] !== undefined;
  }).length;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const currentQuestion = questionAnswers[currentQuestionIndex];

  const getOptionStyle = (qIndex, ansIndex, isCorrect) => {
    const q = questionAnswers[qIndex];
    if (!q) return "border-gray-200";
    const isMultiple = q.questionType === "MULTIPLE_CHOICE";

    if (isMultiple) {
      const isConfirmed = confirmedAnswers[qIndex];
      const selections = selectedAnswers[qIndex] || [];
      const isSelected = selections.includes(ansIndex);
      if (!isConfirmed) return isSelected ? "border-primary bg-primary/10 dark:bg-primary/20" : "border-gray-200 hover:border-primary/50 dark:border-gray-600";
      if (isCorrect) return "border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/30";
      if (isSelected && !isCorrect) return "border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-900/30";
      return "border-gray-200 opacity-50 dark:border-gray-700";
    }

    const userSelected = selectedAnswers[qIndex];
    if (userSelected === undefined) return "border-gray-200 hover:border-primary/50 dark:border-gray-600";
    if (isCorrect) return "border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/30";
    if (userSelected === ansIndex && !isCorrect) return "border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-900/30";
    return "border-gray-200 opacity-50 dark:border-gray-700";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-t-4 border-primary" />
          <p className="font-medium text-gray-500">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  if (error || totalQuestions === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background-light p-4 text-center dark:bg-background-dark">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <img src="https://media.giphy.com/media/WXB88TeARFVvi/giphy.gif" alt="Empty" className="mx-auto mb-4 h-32 w-32 object-contain opacity-80" />
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{error ? "Đã có lỗi xảy ra" : "Chưa có dữ liệu"}</h3>
          <p className="mb-6 text-gray-500 dark:text-gray-400">{error || "Hiện tại chưa có câu hỏi ôn tập nào cho chương này. Vui lòng quay lại sau."}</p>
          <button onClick={() => navigate(-1)} className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95">Quay lại danh sách chương</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-col bg-background-light text-gray-900 transition-colors duration-300 dark:bg-background-dark dark:text-gray-100">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            <button onClick={() => navigate("/subjects")} className="font-bold uppercase tracking-wide hover:text-primary">Môn học</button>
            <span className="material-symbols-outlined text-base">chevron_right</span>
            <button onClick={() => navigate("/listChap", { state: { subjectId } })} className="max-w-[220px] truncate font-bold hover:text-primary">{subjectName || "Môn học"}</button>
            <span className="material-symbols-outlined text-base">chevron_right</span>
            <span className="max-w-[260px] truncate font-bold text-gray-900 dark:text-white">{chapterName || "Ôn tập chương"}</span>
          </nav>

          <section className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="p-6 md:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                <span className="material-symbols-outlined text-base">quiz</span>Ôn tập theo chương
              </div>
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">{chapterName || "Câu hỏi ôn tập"}</h1>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300">Chọn đáp án để xem phản hồi ngay. Bạn có thể chuyển nhanh giữa các câu bằng bảng bên phải.</p>
                </div>
                <div className="rounded-2xl bg-primary/10 px-5 py-4 text-right text-primary">
                  <p className="text-xs font-bold uppercase tracking-wide">Tiến độ</p>
                  <p className="text-3xl font-black">{answeredCount}/{totalQuestions}</p>
                </div>
              </div>
              <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-12 gap-6">
            <aside className="col-span-12 min-w-0 space-y-6 xl:col-span-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-2 line-clamp-2 text-lg font-bold">{chapterName || "Ôn tập chương"}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Môn: {subjectName || "--"}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Số câu: {totalQuestions}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <p className="text-base font-medium">Tiến độ</p>
                <div className="mt-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"><div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} /></div>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Đã trả lời: {answeredCount}/{totalQuestions} câu</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Chế độ ôn tập</h4>
                <div className="flex items-start gap-3 rounded-xl bg-primary/10 p-3 text-sm text-primary"><span className="material-symbols-outlined text-lg">tips_and_updates</span><p>Đáp án đúng/sai sẽ hiển thị sau khi bạn chọn hoặc xác nhận câu nhiều đáp án.</p></div>
              </div>
            </aside>

            <section className="col-span-12 flex min-h-[520px] min-w-0 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 xl:col-span-6">
              <div className="flex-grow p-6">
                <h3 className="pb-2 text-left text-xl font-bold leading-tight text-primary">Câu {currentQuestionIndex + 1}</h3>
                <div className="pb-6 pt-1 text-base font-normal leading-relaxed text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: parseMarkdown(currentQuestion?.content) }} />
                {currentQuestion?.imageUrl && <div className="my-4 text-center"><img src={getFullImageUrl(currentQuestion.imageUrl)} alt="Minh họa câu hỏi" className="mx-auto max-h-64 max-w-full rounded-lg border border-gray-200 shadow-sm dark:border-gray-700" /></div>}

                <div className="space-y-4">
                  {currentQuestion?.answers?.map((answer, ansIndex) => {
                    const isCorrect = answer.isCorrect;
                    const isMultiple = currentQuestion.questionType === "MULTIPLE_CHOICE";
                    const isSelected = isMultiple ? (selectedAnswers[currentQuestionIndex] || []).includes(ansIndex) : selectedAnswers[currentQuestionIndex] === ansIndex;
                    const isRevealed = isMultiple ? confirmedAnswers[currentQuestionIndex] : selectedAnswers[currentQuestionIndex] !== undefined;
                    return (
                      <label key={answer.optionId || ansIndex} className={`flex cursor-pointer items-start rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${getOptionStyle(currentQuestionIndex, ansIndex, isCorrect)}`}>
                        <input type={isMultiple ? "checkbox" : "radio"} name={`question-${currentQuestionIndex}`} className="sr-only" checked={isSelected} onChange={() => handleAnswerSelect(currentQuestionIndex, ansIndex)} disabled={isMultiple ? confirmedAnswers[currentQuestionIndex] : selectedAnswers[currentQuestionIndex] !== undefined} />
                        <span className="mr-4 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white">
                          {isRevealed && isCorrect ? <span className="material-symbols-outlined text-xl text-green-500">check_circle</span> : isRevealed && isSelected && !isCorrect ? <span className="material-symbols-outlined text-xl text-red-500">cancel</span> : isMultiple ? <span className={`material-symbols-outlined text-xl ${isSelected ? "text-primary" : "text-gray-400"}`}>{isSelected ? "check_box" : "check_box_outline_blank"}</span> : <span className={`h-3 w-3 rounded-full ${isSelected ? "bg-primary" : "bg-gray-200"}`} />}
                        </span>
                        <span className={`text-base font-medium ${isRevealed && isCorrect ? "text-green-700 dark:text-green-300" : isRevealed && isSelected && !isCorrect ? "text-red-700 dark:text-red-300" : "text-gray-700 dark:text-gray-200"}`} dangerouslySetInnerHTML={{ __html: parseMarkdown(answer.content) }} />
                      </label>
                    );
                  })}
                </div>

                {currentQuestion.questionType === "MULTIPLE_CHOICE" && !confirmedAnswers[currentQuestionIndex] && (
                  <div className="mt-6 flex justify-center">
                    <button onClick={() => {
                      const selections = selectedAnswers[currentQuestionIndex] || [];
                      if (selections.length === 0) return message.warning("Vui lòng chọn ít nhất một đáp án!");
                      setConfirmedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: true }));
                    }} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-8 font-bold text-white shadow-md transition-all hover:bg-green-700 hover:shadow-lg active:scale-95"><span className="material-symbols-outlined text-lg">check_circle</span><span>Xác nhận đáp án</span></button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 p-4 dark:border-gray-700">
                <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-100 px-5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"><span className="material-symbols-outlined text-base">arrow_back</span><span className="hidden sm:inline">Câu trước</span></button>
                <button onClick={handleNext} disabled={currentQuestionIndex === totalQuestions - 1} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"><span className="hidden sm:inline">Câu tiếp theo</span><span className="material-symbols-outlined text-base">arrow_forward</span></button>
              </div>
            </section>

            <aside className="col-span-12 min-w-0 xl:col-span-3">
              <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-950 dark:text-white"><span className="material-symbols-outlined">grid_view</span>Danh sách câu hỏi</h4>
                <div className="mb-6 grid max-h-[300px] grid-cols-4 justify-items-center gap-2 overflow-y-auto p-2 pr-1 sm:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-5">
                  {questionAnswers.map((item, index) => {
                    const isAnswered = item.questionType === "MULTIPLE_CHOICE" ? confirmedAnswers[index] === true : selectedAnswers[index] !== undefined;
                    const isCurrent = currentQuestionIndex === index;
                    let btnClass = "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400";
                    if (isCurrent) btnClass = "border-primary bg-primary text-white ring-2 ring-primary/20";
                    else if (isAnswered) btnClass = "border-green-600 bg-green-500 text-white";
                    return <button key={index} onClick={() => handleJumpToQuestion(index)} className={`relative flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold transition-all ${btnClass}`}>{index + 1}</button>;
                  })}
                </div>
                <div className="mb-6 space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                  <div className="flex items-center gap-3"><div className="h-4 w-4 rounded-sm bg-primary" /><span>Câu hiện tại</span></div>
                  <div className="flex items-center gap-3"><div className="h-4 w-4 rounded-sm bg-green-500" /><span>Đã trả lời</span></div>
                  <div className="flex items-center gap-3"><div className="h-4 w-4 rounded-sm border border-gray-400 bg-gray-200 dark:bg-white/10" /><span>Chưa trả lời</span></div>
                </div>
                <button onClick={() => navigate(-1)} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-6 text-base font-bold text-gray-700 transition-colors hover:bg-gray-200 active:scale-95 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"><span className="material-symbols-outlined">arrow_back</span><span>Quay lại</span></button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
