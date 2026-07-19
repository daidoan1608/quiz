import React, { createContext, useContext } from 'react';
import { useFavoritesState } from './useFavoritesState';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const favoritesState = useFavoritesState();

  return (
    <FavoritesContext.Provider value={favoritesState}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
