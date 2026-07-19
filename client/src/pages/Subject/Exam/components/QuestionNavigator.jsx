import React from "react";
import { isQuestionAnswered } from "pages/Subject/utils/questionUtils";

export const QuestionNavigator = ({
  texts,
  questions,
  selectedAnswers,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  onSubmit,
}) => (
  <aside className="col-span-12 lg:col-span-3">
    <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h4 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-950 dark:text-white">
        <span className="material-symbols-outlined">grid_view</span>
        {texts.table || "Danh sách câu hỏi"}
      </h4>
      <div className="mb-6 grid max-h-[300px] grid-cols-5 gap-2 overflow-y-auto p-2 pr-1">
        {questions.map((question, idx) => {
          const isCurrent = currentQuestionIndex === idx;
          const isAnswered = isQuestionAnswered(question, selectedAnswers[idx]);
          let bgClass =
            "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400";
          if (isCurrent)
            bgClass = "border-primary bg-primary text-white ring-2 ring-primary/20";
          else if (isAnswered)
            bgClass = "border-green-600 bg-green-500 text-white";
          return (
            <button
              key={idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`relative flex size-9 items-center justify-center rounded-lg text-sm font-bold transition-all ${bgClass}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
      <div className="mb-6 space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
        <div className="flex items-center gap-3">
          <div className="size-4 rounded-sm bg-primary" />
          <span>{texts.currentQuestion || "Câu hiện tại"}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="size-4 rounded-sm bg-green-500" />
          <span>{texts.answered || "Đã trả lời"}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="size-4 rounded-sm border border-gray-400 bg-gray-200 dark:bg-white/10" />
          <span>{texts.notAnswered || "Chưa trả lời"}</span>
        </div>
      </div>
      <button
        onClick={onSubmit}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 text-base font-bold text-white shadow-md transition-all hover:bg-green-700 hover:shadow-lg active:scale-95"
      >
        <span className="material-symbols-outlined">check_circle</span>
        <span>{texts.submit || "Nộp bài"}</span>
      </button>
    </div>
  </aside>
);
