import React from 'react';
import { ProgressBar } from 'components/common/ProgressBar';
import { getAttemptProgress } from 'utils/attemptProgress';

export const getInProgressAttemptKey = (attempt) =>
  attempt.attemptId || attempt.userExamId || attempt.examId;

export default function InProgressAttemptCard({
  attempt,
  labels = {},
  onContinue,
  showAnsweredSummary = false,
  variant = 'default',
}) {
  const progress = getAttemptProgress(attempt);
  const isCompact = variant === 'compact';

  const handleContinue = () => {
    onContinue?.(attempt);
  };

  return (
    <div className="aura-surface-panel border-amber-100 p-5 dark:border-amber-900/40">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="line-clamp-2 font-bold text-gray-900 dark:text-white">
            {attempt.title || labels.examFallback || 'Bài thi đang làm'}
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {attempt.subjectName ||
              labels.subjectFallback ||
              'Chưa xác định môn học'}
            {labels.trailingInfo ? ` • ${labels.trailingInfo}` : ''}
          </p>
        </div>
        <span
          className={
            isCompact
              ? 'shrink-0 rounded bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800'
              : 'shrink-0 rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
          }
        >
          {isCompact ? labels.status || 'Đang làm' : `${progress}%`}
        </span>
      </div>

      <ProgressBar className="mb-3 h-2 w-full" tone="warning" value={progress} />

      <div
        className={
          isCompact
            ? 'flex items-center justify-between'
            : 'flex flex-col gap-3'
        }
      >
        {showAnsweredSummary && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {attempt.answeredCount || 0}/{attempt.totalQuestions || 0}{' '}
            {labels.questionUnit || 'câu'} • {progress}%
          </p>
        )}
        <button
          onClick={handleContinue}
          className={
            isCompact
              ? 'text-sm font-bold text-blue-600 hover:underline'
              : 'aura-button w-full bg-amber-500 px-4 py-2 text-sm text-white hover:bg-amber-600'
          }
          type="button"
        >
          {labels.continue || 'Tiếp tục làm bài'}
        </button>
      </div>
    </div>
  );
}
