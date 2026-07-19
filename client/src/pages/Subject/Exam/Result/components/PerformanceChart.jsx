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
  <div className="flex flex-col gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/40 sm:col-span-2 xl:col-span-1">
    <p className="text-base font-medium text-gray-600 dark:text-gray-300">
      Tỷ lệ câu trả lời trên tổng số câu
    </p>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative size-28 shrink-0">
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

      <div className="flex min-w-0 flex-col gap-2">
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
          <div className="size-3 rounded-full bg-gray-400/50 dark:bg-gray-600" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {skippedAnswers} Bỏ qua ({skippedPercentageOnTotal}%)
          </span>
        </div>
      </div>
    </div>
  </div>
);
