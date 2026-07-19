import React from 'react';
import { categoryIcons } from '../constants/subjectIcons';

export const SubjectSidebar = ({
  categories,
  clearFilters,
  getCategoryName,
  isMobileSidebarOpen,
  selectedCategory,
  setIsMobileSidebarOpen,
  setSelectedCategory,
  texts,
}) => (
  <aside
    className={`${
      isMobileSidebarOpen ? 'fixed inset-0 z-50 flex' : 'hidden lg:flex'
    } lg:sticky lg:top-24 lg:h-fit lg:w-64 lg:flex-col lg:gap-1 rounded-xl lg:row-start-2`}
  >
    <div
      className="fixed inset-0 bg-black/50 lg:hidden"
      onClick={() => setIsMobileSidebarOpen(false)}
    />

    <div className="relative z-50 flex h-full w-4/5 max-w-xs flex-col gap-1 overflow-y-auto rounded-r-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800 lg:h-fit lg:w-full lg:max-w-none lg:rounded-xl lg:shadow-sm">
      <div className="mb-2 px-4 py-2">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {texts.filterLabel || 'Bộ lọc'}
        </p>
        <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
          {texts.facultyMajor || 'Khoa / ngành'}
        </h3>
      </div>

      <button
        onClick={clearFilters}
        className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-left transition-all ${
          !selectedCategory
            ? 'translate-x-1 bg-primary text-white font-bold shadow-md'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
      >
        <span className="material-symbols-outlined">apps</span>
        <span className="text-sm font-semibold">
          {texts.allSubjects || 'Tất cả môn'}
        </span>
      </button>

      {categories.map((category, index) => {
        const categoryId = category.categoryId || category.id;
        const active = selectedCategory === categoryId;
        return (
          <button
            key={categoryId}
            onClick={() => {
              setSelectedCategory(categoryId);
              setIsMobileSidebarOpen(false);
            }}
            className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-left transition-all ${
              active
                ? 'translate-x-1 bg-primary text-white font-bold shadow-md'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <span className="material-symbols-outlined">
              {categoryIcons[(index + 1) % categoryIcons.length]}
            </span>
            <span className="line-clamp-1 text-sm font-semibold">
              {getCategoryName(category)}
            </span>
          </button>
        );
      })}
    </div>
  </aside>
);
