import React, { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { examApi } from "api/examApi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "context/LanguageProvider";
import { parseMarkdown } from "utils/parseMarkdown";
import { typesetMath } from "utils/typesetMath";
import { resolveMediaUrl as getFullImageUrl } from "utils/mediaUrl";

const DEFAULT_CONFIG = { limit: 10, difficulty: "ALL", mode: "all" };

export default function ChapterPractice() {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [confirmedAnswers, setConfirmedAnswers] = useState({});
  const [title, setTitle] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [practiceConfig, setPracticeConfig] = useState(DEFAULT_CONFIG);
  const [markedQuestions, setMarkedQuestions] = useState(new Set());

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const chapterId = location.state?.chapterId || params.chapterId;
  const subjectId = location.state?.subjectId || params.subjectId;
  const userId = localStorage.getItem("userId") || "guest";
  const markedStorageKey = `chapter-practice-marked:${userId}:${chapterId || "unknown"}`;
  const { texts } = useLanguage();

  useEffect(() => {
    const getPracticeQuestions = async () => {
      try {
        setIsLoading(true);
        const markedIds = new Set(JSON.parse(localStorage.getItem(markedStorageKey) || "[]").map(Number));
        const data = await examApi.getChapterQuestions(chapterId, {
          includeCorrectAnswers: true,
          limit: practiceConfig.limit,
          difficulty: practiceConfig.difficulty === "ALL" ? undefined : practiceConfig.difficulty,
          mode: practiceConfig.mode === "wrong" ? "wrong" : "all",
        });

        setMarkedQuestions(markedIds);
        setQuestions(practiceConfig.mode === "marked" ? data.filter((question) => markedIds.has(Number(question.questionId))) : data);
        setSelectedAnswers({});
        setConfirmedAnswers({});
        setCurrentQuestionIndex(0);
        setTitle(location.state?.chapterName || texts.practiceQuestions || "Câu hỏi ôn tập");
        setSubjectName(location.state?.subjectName || texts.subjects || "Môn học");
      } catch (error) {
        console.error("Lỗi tải câu hỏi ôn tập:", error);
        message.error(practiceConfig.mode === "wrong" ? "Chưa thể tải câu sai từ lịch sử làm bài." : "Không thể tải câu hỏi ôn tập.");
      } finally {
        setIsLoading(false);
      }
    };

    if (chapterId) getPracticeQuestions();
  }, [chapterId, location.state?.chapterName, location.state?.subjectName, markedStorageKey, practiceConfig, texts.practiceQuestions, texts.subjects]);

  useEffect(() => {
    typesetMath();
  }, [currentQuestionIndex, questions, selectedAnswers, confirmedAnswers]);

  const currentQuestion = questions[currentQuestionIndex];
  const isMultipleChoice = (question) => question?.questionType === "MULTIPLE_CHOICE";
  const selectedValue = selectedAnswers[currentQuestionIndex];
  const hasAnswered = currentQuestion
    ? isMultipleChoice(currentQuestion)
      ? confirmedAnswers[currentQuestionIndex]
      : selectedValue !== undefined
    : false;

  const answeredCount = useMemo(() => questions.reduce((count, question, index) => {
    const answered = isMultipleChoice(question) ? confirmedAnswers[index] : selectedAnswers[index] !== undefined;
    return answered ? count + 1 : count;
  }, 0), [confirmedAnswers, questions, selectedAnswers]);

  const progressPercent = questions.length ? (answeredCount / questions.length) * 100 : 0;

  const handleAnswerSelect = (answerIndex) => {
    if (!currentQuestion || hasAnswered) return;

    if (isMultipleChoice(currentQuestion)) {
      setSelectedAnswers((prev) => {
        const currentSelection = Array.isArray(prev[currentQuestionIndex]) ? prev[currentQuestionIndex] : [];
        const nextSelection = currentSelection.includes(answerIndex)
          ? currentSelection.filter((idx) => idx !== answerIndex)
          : [...currentSelection, answerIndex];
        return { ...prev, [currentQuestionIndex]: nextSelection };
      });
      return;
    }

    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: answerIndex }));
  };

  const handleConfirmMultipleAnswer = () => {
    const selections = selectedAnswers[currentQuestionIndex] || [];
    if (!Array.isArray(selections) || selections.length === 0) {
      message.warning("Vui lòng chọn ít nhất một đáp án!");
      return;
    }
    setConfirmedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: true }));
  };

  const toggleMarkedQuestion = () => {
    const questionId = Number(currentQuestion?.questionId);
    if (!questionId) return;
    const nextMarked = new Set(markedQuestions);
    if (nextMarked.has(questionId)) nextMarked.delete(questionId);
    else nextMarked.add(questionId);
    setMarkedQuestions(nextMarked);
    localStorage.setItem(markedStorageKey, JSON.stringify([...nextMarked]));
  };

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center">{texts.loadingPracticeQuestions || "Đang tải câu hỏi ôn tập..."}</div>;
  }

  if (!questions.length) {
    const emptyText = practiceConfig.mode === "wrong"
      ? "Bạn chưa có câu sai nào trong chương này."
      : practiceConfig.mode === "marked"
        ? "Bạn chưa đánh dấu câu nào trong chương này."
        : texts.noPracticeQuestionsForChapter || "Chưa có câu hỏi ôn tập cho chương này.";
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-4 text-center">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{emptyText}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => setPracticeConfig(DEFAULT_CONFIG)} className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-md">Luyện tất cả</button>
          <button onClick={() => navigate(-1)} className="rounded-xl bg-gray-100 px-6 py-3 font-bold text-gray-700 shadow-md dark:bg-gray-700 dark:text-gray-200">{texts.back || "Quay lại"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-col bg-background-light text-gray-900 transition-colors duration-300 dark:bg-background-dark dark:text-gray-100">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            <button onClick={() => navigate("/subjects")} className="font-bold uppercase tracking-wide hover:text-primary">{texts.subjects || "Môn học"}</button>
            <span className="material-symbols-outlined text-base">chevron_right</span>
            <button onClick={() => subjectId ? navigate(`/subjects/${subjectId}`, { state: { subjectId } }) : navigate("/subjects")} className="max-w-[220px] truncate font-bold hover:text-primary">{subjectName}</button>
            <span className="material-symbols-outlined text-base">chevron_right</span>
            <span className="max-w-[260px] truncate font-bold text-gray-900 dark:text-white">{title}</span>
          </nav>

          <section className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="p-6 md:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                <span className="material-symbols-outlined text-base">quiz</span>
                {texts.chapterPractice || "Ôn tập theo chương"}
              </div>
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">{title}</h1>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
                    Chọn số câu, độ khó và chế độ ôn tập. Sau mỗi câu, đáp án đúng sẽ hiện ngay để bạn sửa lỗi tư duy.
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 px-5 py-4 text-right text-primary">
                  <p className="text-xs font-bold uppercase tracking-wide">{texts.progress || "Tiến độ"}</p>
                  <p className="text-3xl font-black">{answeredCount}/{questions.length}</p>
                </div>
              </div>
              <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <PracticeSelect label="Số câu" value={practiceConfig.limit} onChange={(value) => setPracticeConfig((prev) => ({ ...prev, limit: Number(value) }))} options={[5, 10, 20, 30, 50].map((value) => ({ value, label: `${value} câu` }))} />
                <PracticeSelect label="Độ khó" value={practiceConfig.difficulty} onChange={(value) => setPracticeConfig((prev) => ({ ...prev, difficulty: value }))} options={[{ value: "ALL", label: "Tất cả" }, { value: "EASY", label: "Dễ" }, { value: "MEDIUM", label: "Trung bình" }, { value: "HARD", label: "Khó" }]} />
                <PracticeSelect label="Chế độ" value={practiceConfig.mode} onChange={(value) => setPracticeConfig((prev) => ({ ...prev, mode: value }))} options={[{ value: "all", label: "Luyện theo chương" }, { value: "wrong", label: "Ôn lại câu sai" }, { value: "marked", label: "Câu đã đánh dấu" }]} />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-12 gap-6">
            <aside className="col-span-12 space-y-6 lg:col-span-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-2 line-clamp-2 text-lg font-bold">{title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Môn: {subjectName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Số câu: {questions.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Đã đánh dấu: {markedQuestions.size}</p>
              </div>
            </aside>

            <section className="col-span-12 flex min-h-[520px] flex-col rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-6">
              <div className="flex-grow p-6">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-left text-xl font-bold leading-tight text-primary">Câu {currentQuestionIndex + 1}</h3>
                  <button onClick={toggleMarkedQuestion} className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${markedQuestions.has(Number(currentQuestion?.questionId)) ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300"}`} title="Đánh dấu câu hỏi">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${markedQuestions.has(Number(currentQuestion?.questionId)) ? 1 : 0}` }}>bookmark</span>
                  </button>
                </div>
                <div className="pb-6 pt-1 text-base font-normal leading-relaxed text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: parseMarkdown(currentQuestion?.content) }} />
                {currentQuestion?.imageUrl && (
                  <div className="my-4 text-center">
                    <img src={getFullImageUrl(currentQuestion.imageUrl)} alt="Minh họa câu hỏi" className="mx-auto max-h-64 max-w-full rounded-lg border border-gray-200 shadow-sm dark:border-gray-700" />
                  </div>
                )}
                <div className="space-y-4">
                  {currentQuestion?.answers?.map((answer, index) => {
                    const isMultiple = isMultipleChoice(currentQuestion);
                    const isSelected = isMultiple ? (Array.isArray(selectedValue) ? selectedValue : []).includes(index) : selectedValue === index;
                    const isCorrect = Boolean(answer.isCorrect);
                    const answerClass = hasAnswered && isCorrect
                      ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200"
                      : hasAnswered && isSelected && !isCorrect
                        ? "border-red-600 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200"
                        : isSelected
                          ? "border-primary bg-primary/10 text-primary dark:bg-primary/20 dark:text-white"
                          : hasAnswered
                            ? "border-gray-200 opacity-60 dark:border-gray-700"
                            : "border-gray-200 hover:border-primary/50 dark:border-gray-600";
                    return (
                      <label key={answer.optionId || index} className={`flex cursor-pointer items-start rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${answerClass}`}>
                        <input type={isMultiple ? "checkbox" : "radio"} name={`question-${currentQuestionIndex}`} className="mt-0.5 h-5 w-5 flex-shrink-0 border-gray-300 text-primary focus:ring-primary" checked={isSelected} onChange={() => handleAnswerSelect(index)} disabled={hasAnswered} />
                        <span className="ml-4 flex-1 text-base font-medium" dangerouslySetInnerHTML={{ __html: parseMarkdown(answer.content) }} />
                        {hasAnswered && isCorrect && <span className="material-symbols-outlined ml-3 text-green-600">check_circle</span>}
                        {hasAnswered && isSelected && !isCorrect && <span className="material-symbols-outlined ml-3 text-red-600">cancel</span>}
                      </label>
                    );
                  })}
                </div>

                {isMultipleChoice(currentQuestion) && !confirmedAnswers[currentQuestionIndex] && (
                  <div className="mt-6 flex justify-center">
                    <button onClick={handleConfirmMultipleAnswer} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-8 font-bold text-white shadow-md transition-all hover:bg-green-700 hover:shadow-lg active:scale-95">
                      <span className="material-symbols-outlined text-lg">check_circle</span><span>Kiểm tra đáp án</span>
                    </button>
                  </div>
                )}

                {hasAnswered && (
                  <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-100">
                    <div className="mb-2 flex items-center gap-2 font-black">
                      <span className="material-symbols-outlined text-base">psychology</span>
                      Giải thích
                    </div>
                    <p>Đáp án đúng được tô xanh. Nếu câu này sai, hãy đánh dấu lại để ôn sau và so sánh lựa chọn của bạn với cụm từ khóa trong đề.</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 p-4 dark:border-gray-700">
                <button onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-100 px-5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                  <span className="material-symbols-outlined text-base">arrow_back</span><span className="hidden sm:inline">Câu trước</span>
                </button>
                <button onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))} disabled={currentQuestionIndex === questions.length - 1} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
                  <span className="hidden sm:inline">Câu tiếp theo</span><span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </section>

            <aside className="col-span-12 lg:col-span-3">
              <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-950 dark:text-white"><span className="material-symbols-outlined">grid_view</span>Danh sách câu hỏi</h4>
                <div className="mb-6 grid max-h-[300px] grid-cols-5 gap-2 overflow-y-auto p-2 pr-1">
                  {questions.map((question, idx) => {
                    const isCurrent = currentQuestionIndex === idx;
                    const isAnswered = isMultipleChoice(question) ? confirmedAnswers[idx] === true : selectedAnswers[idx] !== undefined;
                    let bgClass = "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400";
                    if (isCurrent) bgClass = "border-primary bg-primary text-white ring-2 ring-primary/20";
                    else if (isAnswered) bgClass = "border-green-600 bg-green-500 text-white";
                    return <button key={question.questionId || idx} onClick={() => setCurrentQuestionIndex(idx)} className={`relative flex size-9 items-center justify-center rounded-lg text-sm font-bold transition-all ${bgClass}`}>{idx + 1}{markedQuestions.has(Number(question.questionId)) && <span className="absolute -right-1 -top-1 size-2 rounded-full bg-amber-400" />}</button>;
                  })}
                </div>
                <button onClick={() => navigate(-1)} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-6 text-base font-bold text-gray-700 shadow-md transition-all hover:bg-gray-200 hover:shadow-lg active:scale-95 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                  <span className="material-symbols-outlined">arrow_back</span><span>Quay lại</span>
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

const PracticeSelect = ({ label, value, options, onChange }) => (
  <label className="text-sm font-bold text-gray-700 dark:text-gray-200">
    {label}
    <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>
);
