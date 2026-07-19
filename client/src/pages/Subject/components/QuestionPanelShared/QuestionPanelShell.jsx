import React from 'react';

export default function QuestionPanelShell({
  children,
  footerLabels,
  isNextDisabled,
  isPreviousDisabled,
  onNext,
  onPrevious,
}) {
  return (
    <section className="col-span-12 flex min-h-[520px] flex-col rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-6">
      <div className="flex-grow p-6">{children}</div>
      <div className="flex items-center justify-between border-t border-gray-200 p-4 dark:border-gray-700">
        <button
          onClick={onPrevious}
          disabled={isPreviousDisabled}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-100 px-5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          type="button"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span className="hidden sm:inline">{footerLabels.previous}</span>
        </button>
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
        >
          <span className="hidden sm:inline">{footerLabels.next}</span>
          <span className="material-symbols-outlined text-base">
            arrow_forward
          </span>
        </button>
      </div>
    </section>
  );
}
