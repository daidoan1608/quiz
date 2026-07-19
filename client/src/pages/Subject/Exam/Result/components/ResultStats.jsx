import React from 'react';

export const ResultStats = ({ accuracyOnAnswered, rawScore }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800">
      <p className="text-gray-800 dark:text-gray-300 text-base font-medium leading-normal">
        Điểm số
      </p>
      <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
        {typeof rawScore === 'number' ? rawScore.toFixed(1) : rawScore}/100
      </p>
    </div>
    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800">
      <p className="text-gray-800 dark:text-gray-300 text-base font-medium leading-normal">
        Tỷ lệ chính xác
      </p>
      <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
        {accuracyOnAnswered}%
      </p>
    </div>
    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800">
      <p className="text-gray-800 dark:text-gray-300 text-base font-medium leading-normal">
        Trạng thái
      </p>
      <p
        className={`tracking-light text-3xl font-bold leading-tight ${
          rawScore >= 50
            ? 'text-green-600 dark:text-green-500'
            : 'text-red-600 dark:text-red-500'
        }`}
      >
        {rawScore >= 50 ? 'Đạt' : 'Chưa đạt'}
      </p>
    </div>
  </div>
);
