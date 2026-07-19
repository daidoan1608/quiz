import React from 'react';

export default function FavoritesModalHeader({ favoriteCountText, onClose, t }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-6 dark:border-gray-700">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
          <span className="material-symbols-outlined text-2xl">favorite</span>
        </div>
        <div className="min-w-0">
          <h3 className="text-xl font-black text-gray-950 dark:text-white">
            {t('favoriteSubjectsTitle', 'Môn học yêu thích')}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {favoriteCountText}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        aria-label="Đóng"
        type="button"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}
