import React from 'react';
import { ProgressBar } from './ProgressBar';

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
  const CardTag = onClick ? 'div' : 'article';
  const handleKeyDown = (event) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(event);
    }
  };

  return (
    <CardTag
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`subject-card aura-surface-panel aura-surface-panel-hover group flex ${minHeightClassName} w-full cursor-pointer flex-col gap-5 p-6 text-left ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        {icon && (
          <div className="aura-primary-icon-box aura-primary-icon-box--hover h-14 w-14 rounded-xl">
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
        <h3 className="line-clamp-2 min-h-[3.75rem] text-2xl font-bold leading-tight text-gray-950 transition-colors group-hover:text-primary dark:text-white">
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
          <ProgressBar className="h-2 w-full" value={progress.value} />
        </div>
      )}
    </CardTag>
  );
};
