import React from 'react';
import { isMultipleChoice } from 'pages/Subject/utils/questionUtils';

export const PracticeNavigator = ({
  confirmedAnswers,
  currentQuestionIndex,
  markedQuestions,
  questions,
  selectedAnswers,
  setCurrentQuestionIndex,
}) => (
  <aside className="col-span-12 lg:col-span-3">
    <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h4 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-950 dark:text-white">
        <span className="material-symbols-outlined">grid_view</span>
        Danh sách câu hỏi
      </h4>
      <div className="mb-6 grid max-h-[300px] grid-cols-5 gap-2 overflow-y-auto p-2 pr-1">
        {questions.map((question, idx) => {
          const isCurrent = currentQuestionIndex === idx;
          const isAnswered = isMultipleChoice(question)
            ? confirmedAnswers[idx] === true
            : selectedAnswers[idx] !== undefined;
          let bgClass =
            'border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400';
          if (isCurrent)
            bgClass =
              'border-primary bg-primary text-white ring-2 ring-primary/20';
          else if (isAnswered)
            bgClass = 'border-green-600 bg-green-500 text-white';
          return (
            <button
              key={question.questionId || idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`relative flex size-9 items-center justify-center rounded-lg text-sm font-bold transition-all ${bgClass}`}
            >
              {idx + 1}
              {markedQuestions.has(Number(question.questionId)) && (
                <span className="absolute -right-1 -top-1 size-2 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  </aside>
);
