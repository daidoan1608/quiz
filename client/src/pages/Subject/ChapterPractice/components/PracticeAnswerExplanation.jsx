import React from 'react';

const PracticeAnswerExplanation = () => (
  <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-100">
    <div className="mb-2 flex items-center gap-2 font-black">
      <span className="material-symbols-outlined text-base">psychology</span>
      Giải thích
    </div>
    <p>
      Đáp án đúng được tô xanh. Nếu câu này sai, hãy đánh dấu lại để ôn sau và
      so sánh lựa chọn của bạn với cụm từ khóa trong đề.
    </p>
  </div>
);

export default PracticeAnswerExplanation;
