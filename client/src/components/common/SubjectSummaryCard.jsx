import React from 'react';
import { progressValueStyle } from 'utils/styleVariables';

export const SubjectSummaryCard = ({
  actions,
  className = '',
  icon,
  minHeightClassName = 'min-h-[260px]',
  onClick,
  progress,
  progressLabel,
  status,
  subjectName,
  subtitle,
}) => {
  const CardTag = onClick ? 'button' : 'article';

  return (
    <CardTag
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      className={`subject-card group flex ${minHeightClassName} w-full cursor-pointer flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        {icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
            {icon}
          </div>
        )}
        {(status || actions) && (
          <div className="flex items-center gap-2">
            {status}
            {actions}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="line-clamp-2 text-2xl font-bold leading-tight text-gray-950 transition-colors group-hover:text-primary dark:text-white">
          {subjectName}
        </h3>
        {subtitle && (
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      {progress && (
        <div className="mt-auto space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
              {progressLabel}
            </span>
            <span className="text-sm font-bold text-primary">
              {progress.value}%
            </span>
          </div>
          <div className="aura-progress h-2 w-full">
            <div
              className="aura-progress__bar aura-progress__bar--primary group-hover:brightness-110"
              style={progressValueStyle(progress.value)}
            />
          </div>
        </div>
      )}
    </CardTag>
  );
};
