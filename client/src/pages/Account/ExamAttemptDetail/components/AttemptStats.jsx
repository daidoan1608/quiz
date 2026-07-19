import React from 'react';

export const AttemptStats = ({ accuracyOnAnswered, rawScore }) => (
  <>
    <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/40">
      <p className="text-base font-medium text-gray-600 dark:text-gray-300">
        Điểm số
      </p>
      <p className="text-3xl font-black tracking-tight text-gray-950 dark:text-white">
        {rawScore.toFixed(1)} / 100
      </p>
    </div>
    <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/40">
      <p className="text-base font-medium text-gray-600 dark:text-gray-300">
        Tỷ lệ chính xác
      </p>
      <p className="text-3xl font-black tracking-tight text-gray-950 dark:text-white">
        {accuracyOnAnswered}%
      </p>
    </div>
    <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/40">
      <p className="text-base font-medium text-gray-600 dark:text-gray-300">
        Trạng thái
      </p>
      <p
        className={`${rawScore >= 50 ? 'text-green-600' : 'text-red-500'} text-3xl font-black tracking-tight`}
      >
        {rawScore >= 50 ? 'Đạt' : 'Chưa đạt'}
      </p>
    </div>
  </>
);
