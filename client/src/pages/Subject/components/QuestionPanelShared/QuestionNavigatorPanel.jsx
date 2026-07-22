import React from 'react';

const DEFAULT_LABELS = {
  title: 'Bảng trả lời',
  current: 'Câu hiện tại',
  answered: 'Đã trả lời',
  marked: 'Đã đánh dấu',
  notAnswered: 'Chưa trả lời',
  submit: 'Nộp bài',
};

const getButtonClassName = ({ isAnswered, isCurrent }) => {
  if (isCurrent) {
    return 'border-primary bg-primary text-white ring-2 ring-primary/20';
  }
  if (isAnswered) {
    return 'border-green-600 bg-green-500 text-white';
  }
  return 'border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400';
};

export const QuestionNavigatorPanel = ({
  currentQuestionIndex,
  getQuestionKey = (question, index) => question?.questionId || index,
  isQuestionAnswered,
  isQuestionMarked = () => false,
  labels = DEFAULT_LABELS,
  onSubmit,
  questions,
  setCurrentQuestionIndex,
  showLegend = true,
  submitDisabled = false,
  submitIcon = 'check_circle',
}) => {
  const mergedLabels = { ...DEFAULT_LABELS, ...labels };
  const hasMarkedQuestions = questions.some((question, index) =>
    isQuestionMarked(question, index)
  );

  return (
    <aside className="col-span-12 lg:col-span-3">
      <div className="aura-surface-panel sticky top-24 rounded-2xl p-5">
        <h4 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-950 dark:text-white">
          <span className="material-symbols-outlined">grid_view</span>
          {mergedLabels.title}
        </h4>
        <div className="mb-6 flex max-h-[300px] flex-wrap gap-2 overflow-y-auto overflow-x-hidden p-2 pr-1">
          {questions.map((question, index) => {
            const isCurrent = currentQuestionIndex === index;
            const isAnswered = isQuestionAnswered(question, index);
            const buttonClassName = getButtonClassName({
              isAnswered,
              isCurrent,
            });

            return (
              <button
                key={getQuestionKey(question, index)}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`relative flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all ${buttonClassName}`}
                type="button"
              >
                {index + 1}
                {isQuestionMarked(question, index) && (
                  <span className="absolute -right-1 -top-1 size-2 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
        {showLegend && (
          <div className="mb-6 grid gap-3 border-t border-gray-100 pt-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <div className="size-4 rounded-sm bg-primary" />
              <span>{mergedLabels.current}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-4 rounded-sm bg-green-500" />
              <span>{mergedLabels.answered}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-4 rounded-sm border border-gray-400 bg-gray-200 dark:bg-white/10" />
              <span>{mergedLabels.notAnswered}</span>
            </div>
            {hasMarkedQuestions && (
              <div className="flex items-center gap-3">
                <div className="size-4 rounded-full bg-amber-400" />
                <span>{mergedLabels.marked}</span>
              </div>
            )}
          </div>
        )}
        {onSubmit && (
          <button
            onClick={onSubmit}
            disabled={submitDisabled}
            className="aura-button w-full bg-green-600 px-6 text-base text-white hover:bg-green-700"
            type="button"
          >
            <span className="material-symbols-outlined">{submitIcon}</span>
            <span>{mergedLabels.submit}</span>
          </button>
        )}
      </div>
    </aside>
  );
};
