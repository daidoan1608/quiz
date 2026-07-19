import React from 'react';

export const PracticeEmptyState = ({
  emptyText,
  isSubjectPractice,
  onStartPractice,
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
      {emptyText}
    </p>
    {!isSubjectPractice && (
      <button
        onClick={onStartPractice}
        className="mt-5 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-md"
      >
        Tải lại câu hỏi
      </button>
    )}
  </div>
);
