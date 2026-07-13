import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import { favoriteApi } from "api/favoriteApi";
import { message } from "antd";
import { useAuth } from "context/AuthProvider";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { isLoggedIn } = useAuth(); // Lấy từ AuthProvider
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const favoriteList = await favoriteApi.getByUser(userId);
      setFavorites(favoriteList || []);
    } catch (err) {
      setError("Không thể tải danh sách yêu thích.");
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

  const addFavorite = async (subjectId, subjectName) => {
    if (!userId) {
      message.error("Vui lòng đăng nhập để thêm môn yêu thích");
      return;
    }
    try {
      await favoriteApi.add({
        userId,
        subjectId,
        subjectName,
      });
      setFavorites((prev) => [...prev, { subjectId, subjectName }]);
      message.success("Thêm môn yêu thích thành công");
    } catch (error) {
      message.error("Thêm môn yêu thích thất bại");
    }
  };

  const removeFavorite = async (subjectId, subjectName) => {
    if (!userId) return;
    try {
      await favoriteApi.remove({ userId, subjectId, subjectName });
      setFavorites((prev) => prev.filter((fav) => fav.subjectId !== subjectId));
      message.success("Xóa môn yêu thích thành công");
    } catch (error) {
      message.error("Xóa môn yêu thích thất bại");
    }
  };

  const toggleFavorite = (subjectId, subjectName) => {
    const isFav = favorites.some((fav) => fav.subjectId === subjectId);
    if (isFav) {
      removeFavorite(subjectId, subjectName);
    } else {
      addFavorite(subjectId, subjectName);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, loading, error, setFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
