import React from 'react';

const MarkedQuestionButton = ({ isMarked, onClick }) => (
  <button
    onClick={onClick}
    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
      isMarked
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
    }`}
    title="Đánh dấu câu hỏi"
    type="button"
  >
    <span
      className={`material-symbols-outlined ${isMarked ? 'aura-material-filled' : 'aura-material-outlined'}`}
    >
      bookmark
    </span>
  </button>
);

export default MarkedQuestionButton;
