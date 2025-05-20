// src/context/FavoritesContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { publicAxios } from "../api/axiosConfig";

// Tạo Context
const FavoritesContext = createContext();

// Provider component
export function FavoritesProvider({ userId, children }) {
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [errorFavorites, setErrorFavorites] = useState(null);

  // Load favorites khi userId thay đổi
  useEffect(() => {
    if (!userId) return;
    setLoadingFavorites(true);
    setErrorFavorites(null);

    publicAxios.get(`/api/v1/user/favorites/user/${userId}`)
      .then(resp => {
        setFavorites(resp.data.data || []);
      })
      .catch(err => {
        setErrorFavorites(err.message || "Lỗi khi tải môn yêu thích");
        setFavorites([]);
      })
      .finally(() => {
        setLoadingFavorites(false);
      });
  }, [userId]);

  // Hàm thêm môn yêu thích
  const addFavorite = async (subjectId, subjectName) => {
    try {
      await publicAxios.post("/api/v1/user/favorites", {
        userId,
        subjectId,
        subjectName,
      });
      setFavorites(prev => [...prev, { subjectId, subjectName }]);
    } catch (error) {
      throw error;
    }
  };

  // Hàm xóa môn yêu thích
  const removeFavorite = async (subjectId) => {
    try {
      await publicAxios.delete("/api/v1/user/favorites", {
        data: { userId, subjectId }
      });
      setFavorites(prev => prev.filter(fav => fav.subjectId !== subjectId));
    } catch (error) {
      throw error;
    }
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      loadingFavorites,
      errorFavorites,
      addFavorite,
      removeFavorite
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Hook tiện lợi dùng trong component
export function useFavorites() {
  return useContext(FavoritesContext);
}
