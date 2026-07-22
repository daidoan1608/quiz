import React from 'react';

const CHART_RADIUS = 15.9154943092;

const LegendItem = ({ colorClassName, label }) => (
  <div className="flex items-center gap-2">
    <div className={`size-3 rounded-full ${colorClassName}`} />
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </span>
  </div>
);

const buildLegendLabel = ({ count, label, percentage, showPercentage }) =>
  showPercentage ? `${count} ${label} (${percentage}%)` : `${count} ${label}`;

export const AnswerDistributionChart = ({
  calculatedCorrect,
  calculatedTotal,
  correctPercentageOnTotal,
  correctStroke,
  showPercentage = true,
  skippedAnswers,
  skippedPercentageOnTotal,
  skippedStroke,
  wrongAnswers,
  wrongPercentageOnTotal,
  wrongStroke,
}) => (
  <div className="aura-soft-panel flex flex-col gap-4 p-4 sm:col-span-2 xl:col-span-1">
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
            r={CHART_RADIUS}
            strokeWidth="3"
          />
          <circle
            className="stroke-current text-gray-400/50 transition-all duration-300 ease-out"
            cx="18"
            cy="18"
            fill="none"
            r={CHART_RADIUS}
            strokeDasharray={`${skippedStroke}, 100`}
            strokeDashoffset={0}
            strokeWidth="3"
          />
          <circle
            className="stroke-current text-red-500 transition-all duration-300 ease-out"
            cx="18"
            cy="18"
            fill="none"
            r={CHART_RADIUS}
            strokeDasharray={`${wrongStroke}, 100`}
            strokeDashoffset={-skippedStroke}
            strokeWidth="3"
          />
          <circle
            className="stroke-current text-green-500 transition-all duration-300 ease-out"
            cx="18"
            cy="18"
            fill="none"
            r={CHART_RADIUS}
            strokeDasharray={`${correctStroke}, 100`}
            strokeDashoffset={-(skippedStroke + wrongStroke)}
            strokeWidth="3"
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
        <LegendItem
          colorClassName="bg-green-500"
          label={buildLegendLabel({
            count: calculatedCorrect,
            label: 'Đúng',
            percentage: correctPercentageOnTotal,
            showPercentage,
          })}
        />
        <LegendItem
          colorClassName="bg-red-500"
          label={buildLegendLabel({
            count: wrongAnswers,
            label: 'Sai',
            percentage: wrongPercentageOnTotal,
            showPercentage,
          })}
        />
        <LegendItem
          colorClassName="bg-gray-400/50 dark:bg-gray-600"
          label={buildLegendLabel({
            count: skippedAnswers,
            label: 'Bỏ qua',
            percentage: skippedPercentageOnTotal,
            showPercentage,
          })}
        />
      </div>
    </div>
  </div>
);
