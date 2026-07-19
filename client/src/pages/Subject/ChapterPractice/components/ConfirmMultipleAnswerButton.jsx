import React from 'react';

const ConfirmMultipleAnswerButton = ({ onClick }) => (
  <div className="mt-6 flex justify-center">
    <button
      onClick={onClick}
      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-8 font-bold text-white shadow-md transition-all hover:bg-green-700 hover:shadow-lg active:scale-95"
      type="button"
    >
      <span className="material-symbols-outlined text-lg">check_circle</span>
      <span>Kiểm tra đáp án</span>
    </button>
  </div>
);

export default ConfirmMultipleAnswerButton;
