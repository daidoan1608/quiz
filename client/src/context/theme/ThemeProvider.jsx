import React, { createContext, useContext, useEffect, useState } from 'react';
import { applyThemeToDom } from './applyThemeToDom';
import { getInitialColorTheme, getInitialMode } from './themeStorage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(getInitialMode);
  const [colorTheme, setColorTheme] = useState(getInitialColorTheme);

  useEffect(() => {
    const timer = applyThemeToDom({ colorTheme, mode });

    return () => clearTimeout(timer);
  }, [mode, colorTheme]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: mode,
        toggleTheme,
        mode,
        setMode,
        colorTheme,
        setColorTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

