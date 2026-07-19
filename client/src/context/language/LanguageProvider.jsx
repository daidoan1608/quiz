import React, { createContext, useContext } from 'react';
import { useLanguageValue } from './useLanguageValue';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const languageValue = useLanguageValue();

  return (
    <LanguageContext.Provider value={languageValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
