import React from 'react';

export const PageLoadingState = ({
  className = '',
  label,
  minHeightClassName = 'min-h-[60vh]',
  type = 'cards', // 'cards' | 'list' | 'spinner'
}) => (
  <div className={`w-full aura-page-transition ${className}`}>
    {label && (
      <div className="mb-6 animate-pulse">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{label}</h2>
      </div>
    )}
    {type === 'cards' ? (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aura-surface-panel p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800 space-y-4">
            <div className="h-28 aura-shimmer-bg rounded-xl w-full" />
            <div className="h-6 aura-shimmer-bg rounded-md w-3/4" />
            <div className="h-4 aura-shimmer-bg rounded-md w-1/2" />
            <div className="h-10 aura-shimmer-bg rounded-lg w-full mt-4" />
          </div>
        ))}
      </div>
    ) : type === 'list' ? (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aura-surface-panel p-4 rounded-xl border border-gray-200/60 dark:border-gray-800 flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-5 aura-shimmer-bg rounded w-1/3" />
              <div className="h-4 aura-shimmer-bg rounded w-1/4" />
            </div>
            <div className="h-8 w-24 aura-shimmer-bg rounded-lg" />
          </div>
        ))}
      </div>
    ) : (
      <div className={`aura-page-center ${minHeightClassName}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="aura-loading-spinner" />
        </div>
      </div>
    )}
  </div>
);

export const SectionLoadingState = ({
  className = '',
  label,
  minHeightClassName = 'min-h-40',
  type = 'line', // 'line' | 'spinner'
}) => (
  <div className={`w-full ${className}`}>
    {type === 'line' ? (
      <div className="space-y-3 p-4">
        <div className="h-4 aura-shimmer-bg rounded w-full" />
        <div className="h-4 aura-shimmer-bg rounded w-5/6" />
        <div className="h-4 aura-shimmer-bg rounded w-3/4" />
      </div>
    ) : (
      <div
        className={`flex ${minHeightClassName} items-center justify-center`}
        role="status"
      >
        <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-300">
          <div className="aura-loading-spinner !h-8 !w-8" />
          {label && <p className="text-sm font-medium">{label}</p>}
        </div>
      </div>
    )}
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

const EmptyIllustration = () => (
  <svg
    className="mb-4 h-24 w-24 text-gray-300 dark:text-gray-600"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="60" cy="60" r="48" fill="currentColor" fillOpacity="0.04" />
    <path
      d="M38 35H72C74.2091 35 76 36.7909 76 39V77C76 79.2091 74.2091 81 72 81H38C35.7909 81 34 79.2091 34 77V39C34 36.7909 35.7909 35 38 35Z"
      fill="currentColor"
      fillOpacity="0.08"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M48 45H82C84.2091 45 86 46.7909 86 49V87C86 89.2091 84.2091 91 82 91H48C45.7909 91 44 89.2091 44 87V49C44 46.7909 45.7909 45 48 45Z"
      fill="var(--aura-surface, #ffffff)"
      stroke="var(--aura-primary, currentColor)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="52" y1="57" x2="78" y2="57" stroke="var(--aura-border, currentColor)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="52" y1="67" x2="70" y2="67" stroke="var(--aura-border, currentColor)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="52" y1="77" x2="74" y2="77" stroke="var(--aura-border, currentColor)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M96 36L98 40L102 42L98 44L96 48L94 44L90 42L94 40L96 36Z" fill="var(--aura-primary, currentColor)" opacity="0.6" />
    <circle cx="24" cy="76" r="3" fill="var(--aura-primary, currentColor)" opacity="0.4" />
  </svg>
);

export const PageEmptyState = ({
  action,
  className = '',
  description,
  icon,
  title,
}) => (
  <div className={`aura-empty-state p-8 ${className}`}>
    {icon && icon !== 'inbox' ? (
      <span className="material-symbols-outlined aura-empty-state__icon mb-4">
        {icon}
      </span>
    ) : (
      <EmptyIllustration />
    )}
    {title && <h3 className="aura-empty-state__title text-lg">{title}</h3>}
    {description && (
      <p className="aura-empty-state__description text-sm">{description}</p>
    )}
    {action}
  </div>
);
