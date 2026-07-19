import React from 'react';

export const AttemptStats = ({ accuracyOnAnswered, rawScore }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <p className="text-gray-800 dark:text-gray-300 text-base font-medium">
        Điểm số
      </p>
      <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold">
        {rawScore.toFixed(1)} / 100
      </p>
    </div>
    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <p className="text-gray-800 dark:text-gray-300 text-base font-medium">
        Tỷ lệ chính xác (trên số câu làm)
      </p>
      <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold">
        {accuracyOnAnswered}%
      </p>
    </div>
    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <p className="text-gray-800 dark:text-gray-300 text-base font-medium">
        Trạng thái
      </p>
      <p
        className={`${rawScore >= 50 ? 'text-green-600' : 'text-red-500'} tracking-light text-3xl font-bold`}
      >
        {rawScore >= 50 ? 'Đạt' : 'Chưa đạt'}
      </p>
    </div>
  </div>
);
