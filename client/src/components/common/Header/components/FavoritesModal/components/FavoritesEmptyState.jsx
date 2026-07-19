import React from 'react';

export default function FavoritesEmptyState({ t }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/60">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm dark:bg-gray-900">
        <span className="material-symbols-outlined text-3xl">
          bookmark_add
        </span>
      </div>
      <p className="text-base font-bold text-gray-700 dark:text-gray-200">
        {t('noFavorites', 'Chưa có môn học yêu thích.')}
      </p>
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        Vào danh sách môn học và bấm nút yêu thích trên môn bạn muốn theo dõi.
      </p>
    </div>
  );
}
