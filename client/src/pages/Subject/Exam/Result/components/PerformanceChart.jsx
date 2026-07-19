import React from 'react';

export const PerformanceChart = ({
  calculatedCorrect,
  calculatedTotal,
  correctPercentageOnTotal,
  correctStroke,
  skippedAnswers,
  skippedPercentageOnTotal,
  skippedStroke,
  wrongAnswers,
  wrongPercentageOnTotal,
  wrongStroke,
}) => (
  <div className="flex flex-col gap-6">
    <h2 className="text-gray-900 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]">
      Phân tích hiệu suất
    </h2>
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800">
        <p className="text-gray-800 dark:text-gray-300 text-base font-medium leading-normal">
          Tỷ lệ câu trả lời (trên tổng số câu)
        </p>
        <div className="flex items-center gap-6">
          <div className="relative size-32">
            <svg className="size-full" viewBox="0 0 36 36">
              <circle
                className="stroke-current text-gray-200 dark:text-gray-700"
                cx="18"
                cy="18"
                fill="none"
                r="15.9154943092"
                strokeWidth="3"
              />
              <circle
                className="stroke-current text-gray-400/50 transition-all duration-1000 ease-out"
                cx="18"
                cy="18"
                fill="none"
                r="15.9154943092"
                strokeWidth="3"
                strokeDasharray={`${skippedStroke}, 100`}
                strokeDashoffset={0}
              />
              <circle
                className="stroke-current text-red-500 transition-all duration-1000 ease-out"
                cx="18"
                cy="18"
                fill="none"
                r="15.9154943092"
                strokeWidth="3"
                strokeDasharray={`${wrongStroke}, 100`}
                strokeDashoffset={-skippedStroke}
              />
              <circle
                className="stroke-current text-green-500 transition-all duration-1000 ease-out"
                cx="18"
                cy="18"
                fill="none"
                r="15.9154943092"
                strokeWidth="3"
                strokeDasharray={`${correctStroke}, 100`}
                strokeDashoffset={-(skippedStroke + wrongStroke)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {calculatedCorrect}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                /{calculatedTotal} câu
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {calculatedCorrect} Đúng ({correctPercentageOnTotal}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-red-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {wrongAnswers} Sai ({wrongPercentageOnTotal}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-gray-400/50" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {skippedAnswers} Bỏ qua ({skippedPercentageOnTotal}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
