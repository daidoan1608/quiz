import React from 'react';
import { MetricCard } from 'components/common/MetricCard';
import { PageEmptyState } from 'components/common/PageState';

export const StatsCard = ({ title, value }) => (
  <MetricCard
    label={title}
    labelClassName="!text-xs"
    size="lg"
    surface="subtle"
    tone="primary"
    value={value}
  />
);

const getChapterDisplayNumber = (chapter, index) =>
  chapter.chapterNumber ?? chapter.ChapterNumber ?? index + 1;

export const ChapterCard = ({ chapter, index, onStart, texts }) => {
  const hasQuestions = (chapter.countQuestion || 0) > 0;
  const chapterDisplayNumber = getChapterDisplayNumber(chapter, index);

  return (
    <div className="aura-surface-panel aura-surface-panel-hover flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div
          className={`aura-index-badge h-12 min-w-12 px-3 ${
            hasQuestions ? '' : 'aura-index-badge--muted'
          }`}
        >
          {chapterDisplayNumber}
        </div>
        <div>
          <h4 className="text-lg font-black text-gray-950 dark:text-white">
            {chapter.name}
          </h4>
          <div className="aura-meta-row mt-2">
            <span className="aura-meta-item">
              <span className="material-symbols-outlined">quiz</span>
              {chapter.countQuestion || 0} {texts?.questions || 'câu hỏi'}
            </span>
            <span
              className={`aura-status-pill ${
                hasQuestions ? 'aura-status-pill--primary' : ''
              }`}
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
        className={`aura-button px-6 text-sm ${hasQuestions ? 'aura-button-primary' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}
      >
        {texts?.startReview || 'Bắt đầu ôn'}
      </button>
    </div>
  );
};

export const ExamCard = ({ exam, index, onStart, inProgress, texts }) => (
  <div
    className={`aura-surface-panel aura-surface-panel-hover p-5 ${inProgress ? '!border-primary/40 dark:!border-primary/50' : ''}`}
  >
    <div className="mb-4 flex items-start gap-3">
      <div className="aura-index-badge h-10 w-10">
        {index + 1}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-start gap-2">
          <h4 className="line-clamp-2 text-base font-black text-gray-950 dark:text-white">
            {exam.title}
          </h4>
          {inProgress && (
            <span className="aura-status-pill aura-status-pill--primary">
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
    <div className="aura-meta-row mb-4">
      <span className="aura-meta-item">
        <span className="material-symbols-outlined">help</span>
        {exam.totalQuestions || 0} {texts?.questionUnit || 'câu'}
      </span>
      <span className="aura-meta-item">
        <span className="material-symbols-outlined">timer</span>
        {exam.duration || 60} {texts?.minutes || 'phút'}
      </span>
    </div>
    <button
      onClick={() => onStart(exam)}
      className="aura-button aura-button-primary w-full px-5 text-sm"
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
  <PageEmptyState
    className={compact ? '!py-10' : '!py-14'}
    title={texts?.noContent || 'Chưa có nội dung'}
    description={text}
  />
);
