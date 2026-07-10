// context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext();

const getPrimaryColor = (colorTheme) => {
  switch (colorTheme) {
    case 'emerald': return '#10b981';
    case 'cyberpunk': return '#ec4899';
    case 'sunset': return '#f97316';
    case 'slate': return '#6366f1';
    case 'blue':
    default:
      return '#137fec';
  }
};

const getBgLayoutColor = (colorTheme, mode) => {
  if (mode === 'light') {
    switch (colorTheme) {
      case 'emerald': return '#f0f4f1';
      case 'cyberpunk': return '#f5f0f8';
      case 'sunset': return '#f8f2ee';
      case 'slate': return '#f1f3f7';
      default: return '#f6f7f8';
    }
  } else {
    switch (colorTheme) {
      case 'emerald': return '#0c1814';
      case 'cyberpunk': return '#150c24';
      case 'sunset': return '#180f0c';
      case 'slate': return '#0f172a';
      default: return '#101922';
    }
  }
};

const getBgContainerColor = (colorTheme, mode) => {
  if (mode === 'light') {
    return '#ffffff';
  } else {
    switch (colorTheme) {
      case 'emerald': return '#162620';
      case 'cyberpunk': return '#201334';
      case 'sunset': return '#261713';
      case 'slate': return '#1e293b';
      default: return '#1c2a36';
    }
  }
};

const allowedModes = ['light', 'dark'];
const allowedColorThemes = ['blue', 'emerald', 'cyberpunk', 'sunset', 'slate'];

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('theme-mode') || localStorage.getItem('appTheme') || 'light';
    return allowedModes.includes(savedMode) ? savedMode : 'light';
  });

  const [colorTheme, setColorTheme] = useState(() => {
    const savedColorTheme = localStorage.getItem('theme-color') || 'blue';
    return allowedColorThemes.includes(savedColorTheme) ? savedColorTheme : 'blue';
  });

  const updateMode = (nextMode) => {
    if (allowedModes.includes(nextMode)) {
      setMode(nextMode);
    }
  };

  const updateColorTheme = (nextColorTheme) => {
    if (allowedColorThemes.includes(nextColorTheme)) {
      setColorTheme(nextColorTheme);
    }
  };

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
    localStorage.setItem('appTheme', mode); // Hỗ trợ tương thích ngược
    document.body.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('theme-color', colorTheme);
  }, [colorTheme]);

  const { defaultAlgorithm, darkAlgorithm } = theme;

  return (
    <ThemeContext.Provider
      value={{
        theme: mode, // Hỗ trợ tương thích ngược
        toggleTheme,  // Hỗ trợ tương thích ngược
        mode,
        setMode: updateMode,
        colorTheme,
        setColorTheme: updateColorTheme,
      }}
    >
      <ConfigProvider
        theme={{
          algorithm: mode === 'dark' ? darkAlgorithm : defaultAlgorithm,
          token: {
            colorPrimary: getPrimaryColor(colorTheme),
            borderRadius: 14,
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            colorBgLayout: getBgLayoutColor(colorTheme, mode),
            colorBgContainer: getBgContainerColor(colorTheme, mode),
            colorTextBase: mode === 'dark' ? '#e5e7eb' : '#111827',
            colorBorder: mode === 'dark' ? 'rgba(148, 163, 184, 0.22)' : '#e6eaf0',
            colorBorderSecondary: mode === 'dark' ? 'rgba(148, 163, 184, 0.16)' : '#eef2f7',
            boxShadow: mode === 'dark' ? '0 12px 32px rgba(0,0,0,0.24)' : '0 12px 32px rgba(15,23,42,0.08)',
          },
          components: {
            Layout: {
              bodyBg: getBgLayoutColor(colorTheme, mode),
              headerBg: getBgContainerColor(colorTheme, mode),
              sidebarBg: getBgContainerColor(colorTheme, mode),
            },
            Menu: {
              itemBg: "transparent",
              itemSelectedBg: mode === 'dark' ? 'rgba(19,127,236,0.18)' : 'rgba(19,127,236,0.10)',
              itemSelectedColor: getPrimaryColor(colorTheme),
              itemHoverBg: mode === 'dark' ? 'rgba(148,163,184,0.10)' : 'rgba(15,23,42,0.04)',
            },
            Card: {
              headerFontSize: 16,
            },
            Table: {
              headerBg: mode === 'dark' ? 'rgba(148,163,184,0.08)' : '#f8fafc',
              rowHoverBg: mode === 'dark' ? 'rgba(19,127,236,0.12)' : 'rgba(19,127,236,0.045)',
            },
            Button: {
              controlHeight: 38,
            }
          }
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);