import React from 'react';

export const AppBreadcrumb = ({ className = 'mb-6', items = [] }) => (
  <nav
    aria-label="Breadcrumb"
    className={`${className} flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400`}
  >
    {items.map((item, index) => {
      const isLast = index === items.length - 1;
      const isRoot = index === 0;
      const labelClassName = isLast
        ? 'max-w-[260px] truncate font-bold text-gray-900 dark:text-white'
        : `max-w-[220px] truncate font-bold hover:text-primary ${
            isRoot ? 'uppercase tracking-wide' : ''
          }`;

      return (
        <React.Fragment key={`${item.label}-${index}`}>
          {index > 0 && (
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-base"
            >
              chevron_right
            </span>
          )}
          {item.onClick && !isLast ? (
            <button
              type="button"
              onClick={item.onClick}
              className={labelClassName}
            >
              {item.label}
            </button>
          ) : (
            <span className={labelClassName}>{item.label}</span>
          )}
        </React.Fragment>
      );
    })}
  </nav>
);
