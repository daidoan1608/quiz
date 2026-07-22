import React from 'react';
import { progressBarStyle, progressValueStyle } from 'utils/styleVariables';

const clampProgressValue = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.min(100, Math.max(0, numericValue));
};

export const ProgressBar = ({
  className = 'h-2 w-full',
  tone = 'primary',
  value = 0,
}) => {
  const progressValue = clampProgressValue(value);

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={progressValue}
      className={`aura-progress ${className}`}
      role="progressbar"
    >
      <div
        className="aura-progress__bar"
        style={progressBarStyle({ tone, value: progressValue })}
      />
    </div>
  );
};

export const ReadinessRing = ({ children, className = '', value = 0 }) => {
  const progressValue = clampProgressValue(value);

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={progressValue}
      className={`aura-readiness-ring relative flex shrink-0 items-center justify-center rounded-full ${className}`}
      role="progressbar"
      style={progressValueStyle(progressValue)}
    >
      {children}
    </div>
  );
};
