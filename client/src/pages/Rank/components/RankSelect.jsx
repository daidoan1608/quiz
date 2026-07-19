import React from 'react';

export const RankSelect = ({
  id,
  onChange,
  openSelect,
  options,
  setOpenSelect,
  value,
}) => {
  const selected = options.find((option) => option.value === value) || options[0];
  const isOpen = openSelect === id;

  return (
    <div
      className="relative"
      tabIndex={0}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpenSelect(null);
        }
      }}
    >
      <button
        type="button"
        onClick={() => setOpenSelect(isOpen ? null : id)}
        className={`w-full min-h-12 rounded-2xl border bg-white dark:bg-gray-700/90 pl-4 pr-12 text-left text-base font-semibold text-gray-900 dark:text-white transition-all shadow-sm cursor-pointer
          ${
            isOpen
              ? 'border-primary ring-4 ring-primary/15 shadow-md'
              : 'border-gray-200 dark:border-gray-600 hover:border-primary/50 hover:shadow-md'
          }
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="block truncate">{selected?.label}</span>
        <span
          className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-all dark:bg-primary/15 ${isOpen ? 'rotate-180 bg-primary/15' : ''}`}
        >
          <span className="material-symbols-outlined text-[20px] leading-none">
            expand_more
          </span>
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 right-0 z-30 mt-2 max-h-64 overflow-auto rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 shadow-2xl shadow-gray-900/10 dark:shadow-black/40 animate-[fadeIn_0.12s_ease-out]"
          role="listbox"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(option.value);
                  setOpenSelect(null);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors
                  ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/15'
                  }
                `}
              >
                <span className="truncate">{option.label}</span>
                {active && (
                  <span className="material-symbols-outlined text-[18px] leading-none">
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
