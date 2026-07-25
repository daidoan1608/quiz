import React from 'react';
import { SessionHero } from 'pages/Subject/components/QuestionPanelShared/SessionHero';
import {
  PRACTICE_DIFFICULTY_OPTIONS,
  SMART_WRONG_MODES,
  SUBJECT_MODE_OPTIONS,
} from '../constants/practiceOptions';

export const PracticeControls = ({
  answeredCount,
  hasRequested,
  isLoading,
  isSubjectPractice,
  maxQuestionLimit,
  onModeChange,
  onPracticeConfigChange,
  onStartPractice,
  panelTitle,
  practiceConfig,
  progressPercent,
  questionCount,
  texts,
  wrongPracticeSummary,
}) => {
  const isSmartWrongMode = Boolean(SMART_WRONG_MODES[practiceConfig.mode]);
  const wrongTotal = Number(wrongPracticeSummary?.wrongTotal || 0);
  const practiceTotal = Number(wrongPracticeSummary?.practiceTotal || 0);
  const currentMaxQuestionLimit =
    isSmartWrongMode && wrongPracticeSummary !== null
      ? Math.max(wrongTotal, 1)
      : maxQuestionLimit || 1;
  const hasNoSmartWrongQuestions =
    isSmartWrongMode && wrongPracticeSummary !== null && wrongTotal <= 0;
  const description = `${isSubjectPractice
    ? 'Chọn nhóm câu cần ôn, sau đó bắt đầu khi bạn sẵn sàng.'
    : 'Chọn số câu, độ khó rồi bắt đầu ôn tập theo chương.'} ${
    hasRequested
      ? 'Sau mỗi câu, đáp án đúng sẽ hiện ngay để bạn sửa lỗi tư duy.'
      : isSubjectPractice
        ? 'Câu hỏi chỉ được tải sau khi bạn bấm bắt đầu.'
        : 'Câu hỏi chỉ được tải sau khi bạn bấm bắt đầu.'
  }`;
  const requestedLimit = Number(practiceConfig.limit);
  const limitError =
    Number.isNaN(requestedLimit) || requestedLimit < 1
      ? 'Số câu phải lớn hơn hoặc bằng 1.'
      : requestedLimit > currentMaxQuestionLimit
        ? `Số câu không được vượt quá ${currentMaxQuestionLimit}.`
        : '';

  const updateConfig = (patch) => {
    onPracticeConfigChange((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  return (
    <SessionHero
      action={
        <button
          onClick={onStartPractice}
          disabled={
            isLoading ||
            maxQuestionLimit <= 0 ||
            hasNoSmartWrongQuestions ||
            Boolean(limitError)
          }
          className="aura-button aura-button-primary w-full px-5 text-sm md:w-auto"
          type="button"
        >
          <span className="material-symbols-outlined text-base">
            {hasRequested ? 'filter_alt' : 'play_arrow'}
          </span>
          {hasRequested ? 'Lọc lại' : 'Bắt đầu ôn'}
        </button>
      }
      badgeIcon={hasRequested ? 'quiz' : 'tune'}
      badgeText={isSubjectPractice ? 'Ôn tập thông minh' : 'Ôn tập theo chương'}
      description={description}
      progress={{
        isVisible: hasRequested && questionCount > 0,
        label: texts.progress || 'Tiến độ',
        percent: progressPercent,
        value: `${answeredCount}/${questionCount}`,
      }}
      title={panelTitle}
    >
      <div className="space-y-4">
        {isSubjectPractice && (
          <div className="grid gap-3 sm:grid-cols-2">
            {SUBJECT_MODE_OPTIONS.map((option) => {
              const isActive = practiceConfig.mode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onModeChange(option.value)}
                  className={`aura-option-card ${
                    isActive ? 'aura-option-card--active' : ''
                  }`}
                >
                  <span
                    className={`material-symbols-outlined mt-0.5 text-xl ${
                      isActive ? 'text-primary' : 'text-gray-400'
                    }`}
                  >
                    {option.icon}
                  </span>
                  <span>
                    <span className="block text-base font-black">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-sm font-medium leading-5 text-gray-500 dark:text-gray-400">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {(isSmartWrongMode || !isSubjectPractice) && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="aura-form-label">
                {isSmartWrongMode && wrongPracticeSummary !== null
                  ? `Số câu trên ${wrongTotal} câu sai`
                  : 'Số câu'}
              </span>
              <input
                className="aura-input h-11 w-full px-3 text-sm"
                disabled={isLoading}
                max={currentMaxQuestionLimit}
                min={1}
                onChange={(event) =>
                  updateConfig({ limit: Number(event.target.value) || 1 })
                }
                type="number"
                value={practiceConfig.limit}
              />
              {limitError ? (
                <span className="mt-1 block text-xs font-semibold text-red-500">
                  {limitError}
                </span>
              ) : hasNoSmartWrongQuestions ? (
                <span className="mt-1 block text-xs font-semibold text-red-500">
                  Không có câu sai nào theo bộ lọc hiện tại.
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="aura-form-label">
                Độ khó
              </span>
              <select
                className="aura-input h-11 w-full px-3 text-sm"
                disabled={isLoading}
                onChange={(event) =>
                  updateConfig({ difficulty: event.target.value })
                }
                value={practiceConfig.difficulty}
              >
                {PRACTICE_DIFFICULTY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {isSmartWrongMode && wrongPracticeSummary !== null ? (
              <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-sm font-semibold text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                Có {wrongTotal} câu sai trong {practiceTotal} câu có thể ôn theo bộ lọc hiện tại.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </SessionHero>
  );
};
