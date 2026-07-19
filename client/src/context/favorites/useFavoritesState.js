import { useCallback, useEffect, useState } from 'react';
import { message } from 'antd';
import { favoriteApi } from 'api/services/favoriteApi';
import { useAuth } from 'context/auth/AuthProvider';

export const useFavoritesState = () => {
  const { isLoggedIn } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId');

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const favoriteList = await favoriteApi.getByUser(userId);
      setFavorites(favoriteList || []);
    } catch (err) {
      setError('Không thể tải danh sách yêu thích.');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [isLoggedIn, userId, loadFavorites]);

  const addFavorite = useCallback(
    async (subjectId, subjectName) => {
      if (!userId) {
        message.error('Vui lòng đăng nhập để thêm môn yêu thích');
        return;
      }

      try {
        await favoriteApi.add({ userId, subjectId, subjectName });
        setFavorites((prev) => [...prev, { subjectId, subjectName }]);
        message.success('Thêm môn yêu thích thành công');
      } catch (favoriteError) {
        message.error('Thêm môn yêu thích thất bại');
      }
    },
    [userId]
  );

  const removeFavorite = useCallback(
    async (subjectId, subjectName) => {
      if (!userId) {
        return;
      }

      try {
        await favoriteApi.remove({ userId, subjectId, subjectName });
        setFavorites((prev) =>
          prev.filter((favorite) => favorite.subjectId !== subjectId)
        );
        message.success('Xóa môn yêu thích thành công');
      } catch (favoriteError) {
        message.error('Xóa môn yêu thích thất bại');
      }
    },
    [userId]
  );

  const toggleFavorite = useCallback(
    (subjectId, subjectName) => {
      const isFavorite = favorites.some(
        (favorite) => favorite.subjectId === subjectId
      );

      if (isFavorite) {
        removeFavorite(subjectId, subjectName);
      } else {
        addFavorite(subjectId, subjectName);
      }
    },
    [addFavorite, favorites, removeFavorite]
  );

  return {
    error,
    favorites,
    loading,
    setFavorites,
    toggleFavorite,
  };
};
