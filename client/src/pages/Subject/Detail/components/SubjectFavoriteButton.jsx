import React from 'react';

const SubjectFavoriteButton = ({
  canToggleFavorite,
  isFavorited,
  subjectData,
  subjectId,
  texts,
  toggleFavorite,
}) => (
  <button
    onClick={() => toggleFavorite(subjectId, subjectData.name)}
    disabled={!canToggleFavorite}
    className={`shrink-0 rounded-xl border p-3 transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
      isFavorited
        ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-900/60 dark:bg-red-900/20'
        : 'border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:text-red-500 dark:border-gray-700 dark:bg-gray-900'
    }`}
    title={texts.favorite || 'Yêu thích'}
    type="button"
  >
    <span
      className={`material-symbols-outlined ${isFavorited ? 'aura-material-filled' : 'aura-material-outlined'}`}
    >
      favorite
    </span>
  </button>
);

export default SubjectFavoriteButton;
