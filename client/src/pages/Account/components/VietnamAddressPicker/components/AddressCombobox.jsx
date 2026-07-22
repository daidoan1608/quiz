import { useEffect, useRef, useState } from 'react';

export default function AddressCombobox({
  disabled = false,
  label,
  onQueryChange,
  onSelect,
  options,
  placeholder,
  query,
  selectedId,
  value,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleOptions = options.slice(0, 80);

  return (
    <div className="relative" ref={wrapperRef}>
      <span className="aura-form-label">
        {label}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className="aura-input flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={value ? '' : 'text-gray-400 dark:text-gray-500'}>
          {value || placeholder}
        </span>
        <span className="material-symbols-outlined text-base text-gray-400">
          expand_more
        </span>
      </button>

      {isOpen && !disabled && (
        <div className="aura-floating-panel absolute z-30 mt-2 w-full">
          <div className="border-b border-gray-100 p-2 dark:border-gray-700">
            <input
              autoFocus
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={placeholder}
              className="aura-input w-full px-3 py-2 text-sm font-medium"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {visibleOptions.length ? (
              visibleOptions.map((option) => {
                const isSelected = option.id === selectedId;
                return (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => {
                      onSelect(option);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition ${
                      isSelected
                        ? 'bg-primary/10 font-bold text-primary dark:bg-primary/20'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="truncate">{option.name}</span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-base">
                        check
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Không tìm thấy địa danh phù hợp
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
