import React from 'react';

export const AttemptDetailHeader = ({ navigate, title }) => (
  <div className="flex flex-wrap justify-between gap-4 items-center">
    <div className="flex flex-col gap-2">
      <button
        onClick={() => navigate('/account')}
        className="mb-2 inline-flex w-fit items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
      >
        <span className="material-symbols-outlined !text-lg">arrow_back</span>
        Quay lại tài khoản
      </button>
      <p className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black tracking-[-0.033em]">
        Chi tiết lần làm bài
      </p>
      <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">
        {title}
      </p>
    </div>
  </div>
);
