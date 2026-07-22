import React from 'react';
import { SectionLoadingState } from '../../../../PageState';
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
      <SectionLoadingState label="Đang tải danh sách yêu thích..." />
    );
  }

  if (error) {
    return (
      <div className="aura-alert-error p-5 text-center">
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
