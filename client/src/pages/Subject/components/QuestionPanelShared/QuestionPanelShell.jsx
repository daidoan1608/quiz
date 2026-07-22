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
    <section className="aura-surface-panel col-span-12 flex min-h-[520px] flex-col rounded-2xl lg:col-span-6">
      <div className="flex-grow p-6">{children}</div>
      <div className="flex items-center justify-between border-t border-gray-200 p-4 dark:border-gray-700">
        <button
          onClick={onPrevious}
          disabled={isPreviousDisabled}
          className="aura-button aura-button-subtle px-5 text-sm"
          type="button"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span className="hidden sm:inline">{footerLabels.previous}</span>
        </button>
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className="aura-button aura-button-primary px-5 text-sm"
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
