import React from 'react';
import FavoriteSubjectCard from './FavoriteSubjectCard';
import FavoritesEmptyState from './FavoritesEmptyState';

export default function FavoritesModalBody({
  error,
  favorites,
  loading,
  onDelete,
  onOpenSubject,
  onSmartPractice,
  t,
}) {
  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center text-gray-500 dark:text-gray-400">
        Đang tải danh sách yêu thích...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
        {error}
      </div>
    );
  }

  if (favorites.length === 0) {
    return <FavoritesEmptyState t={t} />;
  }

  return (
    <div className="grid gap-4">
      {favorites.map((favorite, index) => (
        <FavoriteSubjectCard
          favorite={favorite}
          index={index}
          key={favorite.subjectId}
          onDelete={onDelete}
          onOpenSubject={onOpenSubject}
          onSmartPractice={onSmartPractice}
        />
      ))}
    </div>
  );
}
