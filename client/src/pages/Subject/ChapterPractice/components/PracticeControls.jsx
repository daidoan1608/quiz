import React from 'react';
import { SessionHero } from 'pages/Subject/components/QuestionPanelShared/SessionHero';
import {
  PRACTICE_DIFFICULTY_OPTIONS,
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
}) => {
  const description = `${isSubjectPractice
    ? 'Chọn nhóm câu cần ôn, sau đó bắt đầu khi bạn sẵn sàng.'
    : 'Chọn số câu, độ khó rồi bắt đầu ôn tập theo chương.'} ${
    hasRequested
      ? 'Sau mỗi câu, đáp án đúng sẽ hiện ngay để bạn sửa lỗi tư duy.'
      : isSubjectPractice
        ? 'Câu hỏi chỉ được tải sau khi bạn bấm bắt đầu.'
        : 'Câu hỏi chỉ được tải sau khi bạn bấm bắt đầu.'
  }`;
  const safeLimit = Math.min(
    maxQuestionLimit || 1,
    Math.max(1, Number(practiceConfig.limit) || 1)
  );

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
          disabled={isLoading || maxQuestionLimit <= 0}
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

        {!isSubjectPractice && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="aura-form-label">
                Số câu
              </span>
              <input
                className="aura-input h-11 w-full px-3 text-sm"
                disabled={isLoading}
                max={maxQuestionLimit || 1}
                min={1}
                onChange={(event) =>
                  updateConfig({ limit: Number(event.target.value) || 1 })
                }
                type="number"
                value={safeLimit}
              />
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
          </div>
        )}
      </div>
    </SessionHero>
  );
};
