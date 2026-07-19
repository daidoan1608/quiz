import React from 'react';
import { useLanguage } from 'context/language/LanguageProvider';
import FavoritesModalView from './components/FavoritesModalView';
import { useFavoritesModal } from './hooks/useFavoritesModal';

const FavoritesModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const favoritesModal = useFavoritesModal({ onClose });

  if (!isOpen) {
    return null;
  }

  return (
    <FavoritesModalView
      error={favoritesModal.error}
      favoriteCountText={favoritesModal.favoriteCountText}
      favorites={favoritesModal.favorites}
      loading={favoritesModal.loading}
      onClose={onClose}
      onDelete={favoritesModal.handleDelete}
      onOpenSubject={favoritesModal.handleOpenSubject}
      onSmartPractice={favoritesModal.handleSmartPractice}
      t={t}
    />
  );
};

export default FavoritesModal;
