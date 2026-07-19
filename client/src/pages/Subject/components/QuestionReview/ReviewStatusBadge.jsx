import React from 'react';

export default function ReviewStatusBadge({ isCorrect, isSkipped }) {
  return (
    <div
      className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full shrink-0 ${
        isSkipped
          ? 'text-gray-600 bg-gray-100 dark:bg-gray-700/50 dark:text-gray-400'
          : isCorrect
            ? 'text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400'
            : 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400'
      }`}
    >
      <span className="material-symbols-outlined !text-base">
        {isSkipped ? 'radio_button_unchecked' : isCorrect ? 'check_circle' : 'cancel'}
      </span>
      <span>{isSkipped ? 'Bỏ qua' : isCorrect ? 'Đúng' : 'Sai'}</span>
    </div>
  );
}
