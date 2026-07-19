import React from 'react';

export const PracticeInfoCard = ({
  displaySubjectName,
  displayTitle,
  markedCount,
  questionCount,
}) => (
  <aside className="col-span-12 space-y-6 lg:col-span-3">
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h4 className="mb-2 line-clamp-2 text-lg font-bold">{displayTitle}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Môn: {displaySubjectName}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Số câu: {questionCount}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Đã đánh dấu: {markedCount}
      </p>
    </div>
  </aside>
);
