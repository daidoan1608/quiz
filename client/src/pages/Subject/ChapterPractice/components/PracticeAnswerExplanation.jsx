import React from 'react';
import AiExplanationBlock from 'components/Ai/AiExplanationBlock';

const PracticeAnswerExplanation = ({ questionId, selectedAnswerIds = [] }) => (
  <div className="aura-info-note mt-6 p-4 text-sm leading-relaxed">
    <div className="aura-info-note__title mb-2">
      <span className="material-symbols-outlined text-base">psychology</span>
      Giải thích
    </div>
    <p>
      Đáp án đúng được tô xanh. Nếu câu này sai, hãy đánh dấu lại để ôn sau và
      so sánh lựa chọn của bạn với cụm từ khóa trong đề.
    </p>
    {questionId && (
      <AiExplanationBlock
        questionId={questionId}
        selectedAnswerIds={selectedAnswerIds}
      />
    )}
  </div>
);

export default PracticeAnswerExplanation;
