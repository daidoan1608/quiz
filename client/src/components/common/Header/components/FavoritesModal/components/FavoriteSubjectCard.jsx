import React from 'react';

export default function FavoriteSubjectCard({
  favorite,
  index,
  onDelete,
  onOpenSubject,
  onSmartPractice,
}) {
  return (
    <article className="aura-surface-panel aura-surface-panel-hover group rounded-2xl p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => onOpenSubject(favorite.subjectId)}
          className="flex min-w-0 flex-1 items-center gap-4 text-left"
        >
          <div className="aura-primary-icon-box h-12 w-12 flex-shrink-0 rounded-2xl">
            <span className="material-symbols-outlined">
              {index % 2 === 0 ? 'menu_book' : 'school'}
            </span>
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-lg font-black text-gray-950 transition group-hover:text-primary dark:text-white">
              {favorite.subjectName}
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Mở môn học, ôn tập thông minh hoặc xem các chương.
            </p>
          </div>
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            onClick={() => onSmartPractice(favorite)}
            className="aura-button aura-button-primary min-h-10 px-4 text-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">
              psychology
            </span>
            Ôn thông minh
          </button>
          <button
            onClick={() => onOpenSubject(favorite.subjectId)}
            className="aura-button aura-button-subtle min-h-10 px-4 text-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_forward
            </span>
            Chi tiết
          </button>
          <button
            onClick={() => onDelete(favorite.subjectId, favorite.subjectName)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            title="Xóa khỏi yêu thích"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
    </article>
  );
}
