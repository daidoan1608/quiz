import React, { useState, useEffect, useCallback, useRef } from "react";
import { authAxios } from "api/axiosConfig";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useLanguage } from "context/LanguageProvider";
import { parseMarkdown } from "utils/parseMarkdown";
import { typesetMath } from "utils/typesetMath";
import { resolveMediaUrl as getFullImageUrl } from "utils/mediaUrl";
import { createExamDraftKey, getCurrentUserId } from "utils/storage";

export default function Exam() {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState(new Date().toISOString());
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [userExamId, setUserExamId] = useState(null);

  const endTimeRef = useRef(null);
  const handleSubmitRef = useRef(null);
  const selectedAnswersRef = useRef({});
  const currentQuestionIndexRef = useRef(0);
  const userExamIdRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const examId = location.state?.examId || params.examId;
  const subjectId = location.state?.subjectId || params.subjectId;
  const userId = getCurrentUserId();
  const examDraftKey = createExamDraftKey(userId, examId);
  const { texts } = useLanguage();

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    userExamIdRef.current = userExamId;
  }, [userExamId]);

  const isMultipleChoice = (question) => question?.questionType === "MULTIPLE_CHOICE";

  const normalizeSelectedIndexes = (value) => Array.isArray(value) ? value : value !== undefined ? [value] : [];

  const isQuestionAnswered = (question, value) => isMultipleChoice(question)
    ? Array.isArray(value) && value.length > 0
    : value !== undefined;

  const handleSubmit = useCallback(async () => {
    const endTime = new Date().toISOString();

    const correctAnswersCount = questions.reduce((count, question, index) => {
      const selectedIndexes = normalizeSelectedIndexes(selectedAnswers[index]);
      if (!selectedIndexes.length) return count;
      const selectedAnswerIds = selectedIndexes
        .map((answerIndex) => question.answers?.[answerIndex])
        .filter(Boolean)
        .map((answer) => answer.answerId || answer.optionId)
        .sort();
      const correctAnswerIds = (question.answers || [])
        .filter((answer) => answer.isCorrect)
        .map((answer) => answer.answerId || answer.optionId)
        .sort();
      return selectedAnswerIds.length === correctAnswerIds.length && selectedAnswerIds.every((id, idx) => id === correctAnswerIds[idx]) ? count + 1 : count;
    }, 0);

    const userAnswerDtos = Object.entries(selectedAnswers)
      .flatMap(([questionIndex, answerValue]) => {
        const question = questions[questionIndex];
        if (!question) return [];
        return normalizeSelectedIndexes(answerValue)
          .map((answerIndex) => {
            const answer = question.answers?.[answerIndex];
            return answer ? { questionId: question.questionId, answerId: answer.answerId || answer.optionId } : null;
          })
          .filter(Boolean);
      });

    try {
      const response = userExamId
        ? await authAxios.post(`exam-attempts/${userExamId}/submit`)
        : await authAxios.post("user-exams", {
            // Không gửi score từ FE. Backend sẽ tự chấm lại dựa trên userAnswerDtos.
            userExamDto: { userId, examId, startTime, endTime },
            userAnswerDtos,
          });
      if (response.status === 200) {
        setUserExamId(null);
        if (examDraftKey) localStorage.removeItem(examDraftKey);
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
  }, [questions, selectedAnswers, userExamId, examId, subjectId, startTime, duration, timeLeft, navigate, userId, examDraftKey]);

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    const getAllQuestionsByExamId = async () => {
      try {
        setIsLoading(true);
        const [examResponse, attemptResponse] = await Promise.all([
          authAxios.get(`public/exams/${examId}`),
          userId ? authAxios.post("exam-attempts/start", { userId, examId }) : Promise.resolve(null),
        ]);
        const data = examResponse.data.data;
        const attempt = attemptResponse?.data?.data;
        setSubjectName(data.subjectName);
        setTitle(data.title);
        setDuration(data.duration);
        setQuestions(data.questions || []);
        if (attempt?.userExamId) setUserExamId(attempt.userExamId);

        const fallbackStartTime = attempt?.startTime || location.state?.startTime || new Date().toISOString();
        let restoredDraft = null;
        if (examDraftKey) {
          try {
            restoredDraft = JSON.parse(localStorage.getItem(examDraftKey));
          } catch (draftError) {
            console.warn("Không đọc được draft bài thi:", draftError);
            localStorage.removeItem(examDraftKey);
          }
        }

        if (attempt?.userAnswerDtos?.length) {
          const answerIndexByQuestion = {};
          attempt.userAnswerDtos.forEach((userAnswer) => {
            const questionIndex = (data.questions || []).findIndex((question) => question.questionId === userAnswer.questionId);
            if (questionIndex < 0) return;
            const question = (data.questions || [])[questionIndex];
            const answerIndex = (question?.answers || []).findIndex(
              (answer) => (answer.answerId || answer.optionId) === userAnswer.answerId
            );
            if (answerIndex < 0) return;
            if (isMultipleChoice(question)) {
              answerIndexByQuestion[questionIndex] = [...(answerIndexByQuestion[questionIndex] || []), answerIndex];
            } else {
              answerIndexByQuestion[questionIndex] = answerIndex;
            }
          });
          setSelectedAnswers(answerIndexByQuestion);
          setCurrentQuestionIndex(
            Math.min(
              Math.max(Number(attempt.currentQuestionIndex) || 0, 0),
              Math.max((data.questions || []).length - 1, 0)
            )
          );
          const remainingSeconds = Math.max(0, Number(attempt.remainingTime ?? data.duration * 60));
          endTimeRef.current = Date.now() + remainingSeconds * 1000;
          setTimeLeft(remainingSeconds);
          setStartTime(fallbackStartTime);
        } else if (restoredDraft?.endTime && Number(restoredDraft.endTime) > Date.now()) {
          endTimeRef.current = Number(restoredDraft.endTime);
          setTimeLeft(Math.max(0, Math.floor((Number(restoredDraft.endTime) - Date.now()) / 1000)));
          setStartTime(restoredDraft.startTime || fallbackStartTime);
          setSelectedAnswers(restoredDraft.selectedAnswers || {});
          setCurrentQuestionIndex(
            Math.min(
              Math.max(Number(restoredDraft.currentQuestionIndex) || 0, 0),
              Math.max((data.questions || []).length - 1, 0)
            )
          );
        } else if (restoredDraft?.endTime && Number(restoredDraft.endTime) <= Date.now()) {
          endTimeRef.current = Date.now();
          setTimeLeft(0);
          setStartTime(restoredDraft.startTime || fallbackStartTime);
          setSelectedAnswers(restoredDraft.selectedAnswers || {});
          setCurrentQuestionIndex(
            Math.min(
              Math.max(Number(restoredDraft.currentQuestionIndex) || 0, 0),
              Math.max((data.questions || []).length - 1, 0)
            )
          );
        } else {
          const newEndTime = Date.now() + data.duration * 60 * 1000;
          endTimeRef.current = newEndTime;
          setTimeLeft(data.duration * 60);
          setStartTime(fallbackStartTime);
        }
        setIsDraftReady(true);
      } catch (error) {
        console.error("Lỗi tải đề:", error);
        alert("Không thể tải đề thi.");
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };
    if (examId) getAllQuestionsByExamId();
  }, [examId, navigate, location.state?.startTime, examDraftKey, userId]);

  useEffect(() => {
    if (timeLeft === null || !endTimeRef.current || !isDraftReady) return;
    const timerId = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerId);
        handleSubmitRef.current?.();
      }
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isDraftReady]);

  useEffect(() => {
    if (!isDraftReady || !examDraftKey || !endTimeRef.current || userExamId) return;
    localStorage.setItem(
      examDraftKey,
      JSON.stringify({
        examId,
        subjectId,
        startTime,
        endTime: endTimeRef.current,
        selectedAnswers,
        currentQuestionIndex,
      })
    );
  }, [isDraftReady, examDraftKey, examId, subjectId, startTime, selectedAnswers, currentQuestionIndex, userExamId]);

  useEffect(() => {
    if (!isDraftReady || !userExamId || timeLeft === null) return;
    const progressTimer = setTimeout(() => {
      authAxios.patch(`exam-attempts/${userExamId}/progress`, {
        currentQuestionIndex,
        remainingTime: timeLeft,
      }).catch((error) => console.error("Lỗi lưu tiến độ bài thi:", error));
    }, 500);
    return () => clearTimeout(progressTimer);
  }, [isDraftReady, userExamId, currentQuestionIndex, timeLeft]);

  useEffect(() => {
    typesetMath();
  }, [currentQuestionIndex, questions]);

  const saveAnswerToServer = useCallback(async (questionIndex, answerValue) => {
    const attemptId = userExamIdRef.current;
    const question = questions[questionIndex];
    if (!attemptId || !question) return;

    const answerIds = normalizeSelectedIndexes(answerValue)
      .map((answerIndex) => question.answers?.[answerIndex])
      .filter(Boolean)
      .map((answer) => answer.answerId || answer.optionId);

    try {
      await authAxios.put(`exam-attempts/${attemptId}/answers`, {
        questionId: question.questionId,
        answerId: answerIds[0],
        answerIds,
        currentQuestionIndex: questionIndex,
        remainingTime: timeLeft ?? 0,
      });
    } catch (error) {
      console.error("Lỗi lưu đáp án:", error);
    }
  }, [questions, timeLeft]);

  const handleAnswerSelect = (answerIndex) => {
    const question = questions[currentQuestionIndex];
    if (!question) return;

    if (isMultipleChoice(question)) {
      setSelectedAnswers((prev) => {
        const currentSelection = normalizeSelectedIndexes(prev[currentQuestionIndex]);
        const nextSelection = currentSelection.includes(answerIndex)
          ? currentSelection.filter((idx) => idx !== answerIndex)
          : [...currentSelection, answerIndex];
        const nextAnswers = { ...prev };
        if (nextSelection.length) nextAnswers[currentQuestionIndex] = nextSelection;
        else delete nextAnswers[currentQuestionIndex];
        saveAnswerToServer(currentQuestionIndex, nextSelection);
        return nextAnswers;
      });
      return;
    }

    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: answerIndex }));
    saveAnswerToServer(currentQuestionIndex, answerIndex);
  };

  const safeTimeLeft = timeLeft ?? 0;
  const hours = Math.floor(safeTimeLeft / 3600);
  const minutes = Math.floor((safeTimeLeft % 3600) / 60);
  const seconds = safeTimeLeft % 60;

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center">{texts.loadingExam || "Đang tải đề thi..."}</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = questions.reduce((count, question, index) => isQuestionAnswered(question, selectedAnswers[index]) ? count + 1 : count, 0);
  const progressPercent = questions.length ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="relative flex w-full flex-col bg-background-light text-gray-900 transition-colors duration-300 dark:bg-background-dark dark:text-gray-100">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            <button onClick={() => navigate("/subjects")} className="font-bold uppercase tracking-wide hover:text-primary">{texts.subjects || "Môn học"}</button>
            <span className="material-symbols-outlined text-base">chevron_right</span>
            <button
              onClick={() => subjectId ? navigate(`/subjects/${subjectId}`, { state: { subjectId } }) : navigate("/subjects")}
              className="max-w-[220px] truncate font-bold hover:text-primary"
            >
              {subjectName || texts.subjects || "Môn học"}
            </button>
            <span className="material-symbols-outlined text-base">chevron_right</span>
            <span className="max-w-[260px] truncate font-bold text-gray-900 dark:text-white">{title || texts.exam || "Bài kiểm tra"}</span>
          </nav>

          <section className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="p-6 md:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                <span className="material-symbols-outlined text-base">quiz</span>
                {texts.takeExam || "Làm bài kiểm tra"}
              </div>
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">{title || texts.exam || "Bài kiểm tra"}</h1>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
                    {texts.examDescription || "Hoàn thành các câu hỏi trong thời gian quy định. Bạn có thể chuyển nhanh giữa các câu bằng bảng bên phải."}
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
            </div>
          </section>

          <div className="grid grid-cols-12 gap-6">
            <aside className="col-span-12 space-y-6 lg:col-span-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-2 line-clamp-2 text-lg font-bold">{title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{texts.subject || "Môn"}: {subjectName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{texts.questionCountLabel || "Số câu"}: {questions.length}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-4 text-center text-base font-semibold">{texts.countDown || texts.conutDown || "Thời gian còn lại"}</h4>
                <div className="flex gap-3">
                  {[hours, minutes, seconds].map((val, idx) => (
                    <div key={idx} className="flex grow basis-0 flex-col items-stretch gap-2">
                      <div className="flex h-16 grow items-center justify-center rounded-xl bg-primary/10 px-3 text-primary">
                        <p className="text-2xl font-bold tracking-[-0.015em]">{val.toString().padStart(2, "0")}</p>
                      </div>
                      <p className="text-center text-xs text-gray-500 dark:text-gray-400">{idx === 0 ? (texts.hours || "Giờ") : idx === 1 ? (texts.minutes || "Phút") : (texts.seconds || "Giây")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <section className="col-span-12 flex min-h-[520px] flex-col rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-6">
              <div className="flex-grow p-6">
                <h3 className="pb-2 text-left text-xl font-bold leading-tight text-primary">{texts.questionLabel || "Câu"} {currentQuestionIndex + 1}</h3>
                <div className="pb-6 pt-1 text-base font-normal leading-relaxed text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: parseMarkdown(currentQuestion?.content) }} />
                {currentQuestion?.imageUrl && (
                  <div className="my-4 text-center">
                    <img src={getFullImageUrl(currentQuestion.imageUrl)} alt={texts.questionIllustration || "Minh họa câu hỏi"} className="mx-auto max-h-64 max-w-full rounded-lg border border-gray-200 shadow-sm dark:border-gray-700" />
                  </div>
                )}
                <div className="space-y-4">
                  {currentQuestion?.answers?.map((answer, index) => {
                    const isMultiple = isMultipleChoice(currentQuestion);
                    const selectedValue = selectedAnswers[currentQuestionIndex];
                    const isSelected = isMultiple ? normalizeSelectedIndexes(selectedValue).includes(index) : selectedValue === index;
                    return (
                      <label key={answer.optionId || index} className={`flex cursor-pointer items-start rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${isSelected ? "border-primary bg-primary/10 dark:bg-primary/20" : "border-gray-200 hover:border-primary/50 dark:border-gray-600"}`}>
                        <input type={isMultiple ? "checkbox" : "radio"} name={`question-${currentQuestionIndex}`} className="mt-0.5 h-5 w-5 flex-shrink-0 border-gray-300 text-primary focus:ring-primary" checked={isSelected} onChange={() => handleAnswerSelect(index)} />
                        <span className={`ml-4 text-base font-medium ${isSelected ? "text-primary dark:text-white" : ""}`} dangerouslySetInnerHTML={{ __html: parseMarkdown(answer.content) }} />
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 p-4 dark:border-gray-700">
                <button onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-100 px-5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                  <span className="material-symbols-outlined text-base">arrow_back</span><span className="hidden sm:inline">{texts.previousQuestion || "Câu trước"}</span>
                </button>
                <button onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))} disabled={currentQuestionIndex === questions.length - 1} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
                  <span className="hidden sm:inline">{texts.nextQuestion || "Câu tiếp theo"}</span><span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </section>

            <aside className="col-span-12 lg:col-span-3">
              <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-950 dark:text-white"><span className="material-symbols-outlined">grid_view</span>{texts.table || "Danh sách câu hỏi"}</h4>
                <div className="mb-6 grid max-h-[300px] grid-cols-5 gap-2 overflow-y-auto p-2 pr-1">
                  {questions.map((question, idx) => {
                    const isCurrent = currentQuestionIndex === idx;
                    const isAnswered = isQuestionAnswered(question, selectedAnswers[idx]);
                    let bgClass = "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400";
                    if (isCurrent) bgClass = "border-primary bg-primary text-white ring-2 ring-primary/20";
                    else if (isAnswered) bgClass = "border-green-600 bg-green-500 text-white";
                    return <button key={idx} onClick={() => setCurrentQuestionIndex(idx)} className={`relative flex size-9 items-center justify-center rounded-lg text-sm font-bold transition-all ${bgClass}`}>{idx + 1}</button>;
                  })}
                </div>
                <div className="mb-6 space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                  <div className="flex items-center gap-3"><div className="size-4 rounded-sm bg-primary" /><span>{texts.currentQuestion || "Câu hiện tại"}</span></div>
                  <div className="flex items-center gap-3"><div className="size-4 rounded-sm bg-green-500" /><span>{texts.answered || "Đã trả lời"}</span></div>
                  <div className="flex items-center gap-3"><div className="size-4 rounded-sm border border-gray-400 bg-gray-200 dark:bg-white/10" /><span>{texts.notAnswered || "Chưa trả lời"}</span></div>
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
