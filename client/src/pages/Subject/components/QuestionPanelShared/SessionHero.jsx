import React from 'react';
import { progressValueStyle } from 'utils/styleVariables';

export const SessionHero = ({
  action,
  badgeIcon,
  badgeText,
  children,
  description,
  progress,
  title,
}) => (
  <section className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        {badgeText && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            {badgeIcon && (
              <span className="material-symbols-outlined text-base">
                {badgeIcon}
              </span>
            )}
            {badgeText}
          </div>
        )}
        <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300 md:text-base">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
    {progress?.isVisible && (
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-primary">
          <span>{progress.label}</span>
          <span>{progress.value}</span>
        </div>
        <div className="aura-progress h-2.5 w-full">
          <div
            className="aura-progress__bar aura-progress__bar--primary"
            style={progressValueStyle(progress.percent)}
          />
        </div>
      </div>
    )}
    {children && <div className="mt-5">{children}</div>}
  </section>
);
