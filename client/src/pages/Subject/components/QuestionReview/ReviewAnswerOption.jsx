import React from 'react';
import { parseMarkdown } from 'utils/markdown/parseMarkdown';

const getAnswerClass = ({ isRightAnswer, isUserChoice }) => {
  if (isUserChoice && !isRightAnswer) {
    return 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30';
  }

  if (isRightAnswer) {
    return 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/30';
  }

  return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60';
};

export default function ReviewAnswerOption({
  answer,
  answerId,
  answerIndex,
  borderStyleClass = 'border',
  isRightAnswer,
  isUserChoice,
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg ${borderStyleClass} p-3 ${getAnswerClass({
        isRightAnswer,
        isUserChoice,
      })}`}
    >
      <div
        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isRightAnswer
            ? 'bg-green-500 text-white'
            : isUserChoice
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
        }`}
      >
        {String.fromCharCode(65 + answerIndex)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {isRightAnswer && (
            <span className="aura-status-pill aura-status-pill--success">
              <span className="material-symbols-outlined !text-sm">
                check_circle
              </span>
              Đáp án đúng
            </span>
          )}
          {isUserChoice && (
            <span
              className={`aura-status-pill ${
                isRightAnswer
                  ? 'aura-status-pill--primary'
                  : 'aura-status-pill--danger'
              }`}
            >
              <span className="material-symbols-outlined !text-sm">person</span>
              Bạn chọn
            </span>
          )}
        </div>
        <div
          className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200"
          dangerouslySetInnerHTML={{
            __html: parseMarkdown(answer.content),
          }}
        />
      </div>
    </div>
  );
}
