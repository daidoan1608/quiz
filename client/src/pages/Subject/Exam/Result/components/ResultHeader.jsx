import React from 'react';

export const ResultHeader = ({ rawScore, title }) => (
  <div className="flex flex-wrap justify-between gap-4 items-center">
    <div className="flex flex-col gap-2">
      <p className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black tracking-[-0.033em]">
        Kết quả: {title}
      </p>
      <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">
        {rawScore >= 50
          ? 'Chúc mừng! Bạn đã hoàn thành bài kiểm tra.'
          : 'Kết quả chưa tốt, hãy cố gắng hơn lần sau nhé!'}
      </p>
    </div>
  </div>
);
