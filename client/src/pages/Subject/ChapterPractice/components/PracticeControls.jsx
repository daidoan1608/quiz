import React from 'react';
import { SessionHero } from 'pages/Subject/components/QuestionPanelShared/SessionHero';
import { SUBJECT_MODE_OPTIONS } from '../constants/practiceOptions';

export const PracticeControls = ({
  answeredCount,
  hasRequested,
  isLoading,
  isSubjectPractice,
  maxQuestionLimit,
  onModeChange,
  onStartPractice,
  panelTitle,
  practiceConfig,
  progressPercent,
  questionCount,
  texts,
}) => {
  const description = `${isSubjectPractice
    ? 'Chọn nhóm câu cần ôn, sau đó bắt đầu khi bạn sẵn sàng.'
    : 'Ôn tập trực tiếp toàn bộ câu hỏi thuộc chương đã chọn.'} ${
    hasRequested
      ? 'Sau mỗi câu, đáp án đúng sẽ hiện ngay để bạn sửa lỗi tư duy.'
      : isSubjectPractice
        ? 'Câu hỏi chỉ được tải sau khi bạn bấm bắt đầu.'
        : 'Hệ thống đang chuẩn bị câu hỏi cho chương này.'
  }`;

  return (
    <SessionHero
      action={
        isSubjectPractice && (
        <button
          onClick={onStartPractice}
          disabled={isLoading || maxQuestionLimit <= 0}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
        >
          <span className="material-symbols-outlined text-base">
            {hasRequested ? 'filter_alt' : 'play_arrow'}
          </span>
          {hasRequested ? 'Lọc lại' : 'Bắt đầu ôn'}
        </button>
        )
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
      {isSubjectPractice && (
        <div className="grid gap-3 sm:grid-cols-2">
          {SUBJECT_MODE_OPTIONS.map((option) => {
            const isActive = practiceConfig.mode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onModeChange(option.value)}
                className={`flex min-h-24 items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  isActive
                    ? 'border-primary bg-primary/10 text-primary shadow-sm dark:bg-primary/15'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-primary/50 hover:text-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
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
    </SessionHero>
  );
};
