import React from 'react';

export const StatsCard = ({ title, value }) => (
  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {title}
    </span>
    <span className="text-3xl font-black text-primary">{value}</span>
  </div>
);

export const ChapterCard = ({ chapter, index, onStart, texts }) => {
  const hasQuestions = (chapter.countQuestion || 0) > 0;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-black ${hasQuestions ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}
        >
          {index + 1}
        </div>
        <div>
          <h4 className="text-lg font-black text-gray-950 dark:text-white">
            {chapter.name}
          </h4>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-base">quiz</span>
              {chapter.countQuestion || 0} {texts?.questions || 'câu hỏi'}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${hasQuestions ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}
            >
              {hasQuestions
                ? texts?.canReview || 'Có thể ôn'
                : texts?.noQuestionsYet || 'Chưa có câu hỏi'}
            </span>
          </div>
        </div>
      </div>
      <button
        disabled={!hasQuestions}
        onClick={() => onStart(chapter)}
        className={`rounded-xl px-6 py-3 text-sm font-bold transition-all ${hasQuestions ? 'bg-primary text-white shadow-md hover:shadow-lg active:scale-95' : 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700'}`}
      >
        {texts?.startReview || 'Bắt đầu ôn'}
      </button>
    </div>
  );
};

export const ExamCard = ({ exam, index, onStart, inProgress, texts }) => (
  <div
    className={`rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800 ${inProgress ? 'border-amber-300 dark:border-amber-700' : 'border-gray-200 dark:border-gray-700'}`}
  >
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-black text-primary">
        {index + 1}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-start gap-2">
          <h4 className="line-clamp-2 text-base font-black text-gray-950 dark:text-white">
            {exam.title}
          </h4>
          {inProgress && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              {texts?.inProgress || 'Đang làm'}
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {exam.description ||
            texts?.examDescriptionFallback ||
            'Bài kiểm tra tổng hợp kiến thức môn học.'}
        </p>
      </div>
    </div>
    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
      <span className="inline-flex items-center gap-1">
        <span className="material-symbols-outlined text-base">help</span>
        {exam.totalQuestions || 0} {texts?.questionUnit || 'câu'}
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="material-symbols-outlined text-base">timer</span>
        {exam.duration || 60} {texts?.minutes || 'phút'}
      </span>
    </div>
    <button
      onClick={() => onStart(exam)}
      className={`w-full rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95 ${inProgress ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary'}`}
    >
      {inProgress
        ? texts?.continue || 'Tiếp tục'
        : texts?.startExam || 'Bắt đầu làm'}
    </button>
  </div>
);

export const MiniInfo = ({ label, value }) => (
  <div>
    <span className="block text-xs font-bold uppercase text-gray-500">
      {label}
    </span>
    <span className="text-lg font-black text-gray-950 dark:text-white">
      {value}
    </span>
  </div>
);

export const EmptyState = ({ text, compact = false, texts }) => (
  <div
    className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800 ${compact ? 'py-10' : 'py-14'}`}
  >
    <span className="material-symbols-outlined mb-3 text-5xl text-gray-300">
      inbox
    </span>
    <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
      {texts?.noContent || 'Chưa có nội dung'}
    </h3>
    <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">{text}</p>
  </div>
);
