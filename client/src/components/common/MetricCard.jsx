import React from 'react';

const toneClasses = {
  danger: 'text-red-600 dark:text-red-500',
  default: 'text-gray-950 dark:text-white',
  primary: 'text-primary',
  success: 'text-green-600 dark:text-green-500',
};

const surfaceClasses = {
  flat: 'rounded-lg bg-gray-50 p-4 dark:bg-gray-900/40',
  raised: 'aura-surface-panel p-5',
  subtle: 'aura-soft-panel p-4',
};

const sizeClasses = {
  lg: 'text-3xl',
  md: 'text-2xl',
  sm: 'text-lg',
};

export function MetricCard({
  className = '',
  icon,
  label,
  labelClassName = '',
  size = 'md',
  surface = 'raised',
  tone = 'default',
  value,
}) {
  return (
    <div className={`${surfaceClasses[surface]} ${className}`}>
      {icon && (
        <div className="aura-primary-icon-box mb-3 size-10 rounded-lg">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      )}
      <p
        className={`text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 ${labelClassName}`}
      >
        {label}
      </p>
      <p
        className={`mt-1 font-black ${sizeClasses[size]} ${toneClasses[tone]}`}
      >
        {value}
      </p>
    </div>
  );
}
