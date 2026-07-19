import React from 'react';
import { progressValueStyle } from 'utils/styleVariables';
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
}) => (
  <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-8">
    <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
      <span className="material-symbols-outlined text-base">
        {hasRequested ? 'quiz' : 'tune'}
      </span>
      {isSubjectPractice ? 'Ôn tập thông minh theo môn' : 'Ôn tập theo chương'}
    </div>
    <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">
      {panelTitle}
    </h1>
    <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
      {isSubjectPractice
        ? 'Chọn tab câu sai hoặc câu đã lưu để ôn riêng trong môn này.'
        : 'Ôn tập trực tiếp toàn bộ câu hỏi thuộc chương đã chọn.'}{' '}
      {hasRequested
        ? 'Sau mỗi câu, đáp án đúng sẽ hiện ngay để bạn sửa lỗi tư duy.'
        : isSubjectPractice
          ? 'Hệ thống chỉ tải câu hỏi sau khi bạn bấm bắt đầu.'
          : 'Hệ thống đang chuẩn bị câu hỏi cho chương này.'}
    </p>
    {hasRequested && questionCount > 0 && (
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-primary">
          <span>{texts.progress || 'Tiến độ'}</span>
          <span>
            {answeredCount}/{questionCount}
          </span>
        </div>
        <div className="aura-progress h-2.5 w-full">
          <div
            className="aura-progress__bar aura-progress__bar--primary"
            style={progressValueStyle(progressPercent)}
          />
        </div>
      </div>
    )}
    <div className="mt-6">
      {isSubjectPractice && (
        <div className="grid gap-3 rounded-xl bg-gray-100 p-1.5 dark:bg-gray-900 sm:grid-cols-2">
          {SUBJECT_MODE_OPTIONS.map((option) => {
            const isActive = practiceConfig.mode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onModeChange(option.value)}
                className={`flex h-14 items-center justify-center rounded-xl px-4 text-base font-black transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-primary dark:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
      {isSubjectPractice && (
        <button
          onClick={onStartPractice}
          disabled={isLoading || maxQuestionLimit <= 0}
          className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {hasRequested ? 'Lọc lại' : 'Bắt đầu ôn'}
        </button>
      )}
    </div>
  </section>
);
