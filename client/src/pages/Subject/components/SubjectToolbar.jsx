import React from 'react';

export const SubjectToolbar = ({
  searchQuery,
  setIsMobileSidebarOpen,
  setSearchQuery,
  texts,
}) => (
  <div className="flex flex-col justify-between gap-4 lg:col-span-2 lg:flex-row lg:items-center">
    <nav className="flex flex-wrap items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      <span className="text-gray-900 dark:text-white">
        {texts.subjects || 'MÔN HỌC'}
      </span>
    </nav>

    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
      <div className="relative flex-1 sm:w-72">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          search
        </span>
        <input
          type="text"
          placeholder={texts.placeholder || 'Tìm kiếm môn học...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-12 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 lg:hidden"
      >
        <span className="material-symbols-outlined">filter_list</span>
        {texts.filterLabel || 'Bộ lọc'}
      </button>
    </div>
  </div>
);
