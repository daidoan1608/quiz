import React from 'react';
import FavoritesModalBody from './FavoritesModalBody';
import FavoritesModalHeader from './FavoritesModalHeader';

export default function FavoritesModalView({
  error,
  favoriteCountText,
  favorites,
  loading,
  onClose,
  onDelete,
  onOpenSubject,
  onSmartPractice,
  t,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex max-h-[84vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200 dark:bg-surface-dark dark:ring-white/10">
        <FavoritesModalHeader
          favoriteCountText={favoriteCountText}
          onClose={onClose}
          t={t}
        />

        <div className="overflow-y-auto p-6">
          <FavoritesModalBody
            error={error}
            favorites={favorites}
            loading={loading}
            onDelete={onDelete}
            onOpenSubject={onOpenSubject}
            onSmartPractice={onSmartPractice}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
