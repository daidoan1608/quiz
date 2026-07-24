import React from 'react';

export const PageLoadingState = ({
  className = '',
  label,
  minHeightClassName = 'min-h-[60vh]',
}) => (
  <div className={`aura-page-center ${minHeightClassName} ${className}`}>
    <div className="flex flex-col items-center gap-4">
      <div className="aura-loading-spinner" />
      {label && (
        <p className="font-medium text-gray-500 dark:text-gray-300">{label}</p>
      )}
    </div>
  </div>
);

export const SectionLoadingState = ({
  className = '',
  label,
  minHeightClassName = 'min-h-40',
}) => (
  <div
    className={`flex ${minHeightClassName} items-center justify-center ${className}`}
    role="status"
    aria-live="polite"
  >
    <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-300">
      <div className="aura-loading-spinner !h-8 !w-8" />
      {label && <p className="text-sm font-medium">{label}</p>}
    </div>
  </div>
);

export const PageErrorState = ({
  actions,
  className = '',
  description,
  icon = 'error',
  title,
}) => (
  <section className={`aura-surface-panel p-6 text-center ${className}`}>
    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    {title && (
      <h1 className="mt-4 text-2xl font-black text-gray-950 dark:text-white">
        {title}
      </h1>
    )}
    {description && (
      <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
        {description}
      </p>
    )}
    {actions && (
      <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>
    )}
  </section>
);

export const PageEmptyState = ({
  action,
  className = '',
  description,
  icon = 'inbox',
  title,
}) => (
  <div className={`aura-empty-state p-8 ${className}`}>
    <span className="material-symbols-outlined aura-empty-state__icon">
      {icon}
    </span>
    {title && <h3 className="aura-empty-state__title text-lg">{title}</h3>}
    {description && (
      <p className="aura-empty-state__description text-sm">{description}</p>
    )}
    {action}
  </div>
);
