// context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { App as AntApp, ConfigProvider, theme } from 'antd';
import { setMessageApi, setNotificationApi } from '../utils/ui/messageService';

const ThemeContext = createContext();

const themePalettes = {
  light: {
    blue: {
      primary: '#2563eb',
      bgLayout: '#eef4ff',
      bgContainer: '#ffffff',
      selectedBg: 'rgba(37, 99, 235, 0.10)',
      hoverBg: 'rgba(15, 23, 42, 0.045)',
      tableHeaderBg: '#f7faff',
      tableHoverBg: 'rgba(37, 99, 235, 0.055)',
    },
    emerald: {
      primary: '#059669',
      bgLayout: '#eef8f3',
      bgContainer: '#ffffff',
      selectedBg: 'rgba(5, 150, 105, 0.10)',
      hoverBg: 'rgba(6, 95, 70, 0.055)',
      tableHeaderBg: '#f5fbf8',
      tableHoverBg: 'rgba(5, 150, 105, 0.055)',
    },
    cyberpunk: {
      primary: '#db2777',
      bgLayout: '#fbf1f7',
      bgContainer: '#ffffff',
      selectedBg: 'rgba(219, 39, 119, 0.10)',
      hoverBg: 'rgba(131, 24, 67, 0.055)',
      tableHeaderBg: '#fff7fb',
      tableHoverBg: 'rgba(219, 39, 119, 0.055)',
    },
    sunset: {
      primary: '#ea580c',
      bgLayout: '#fff4ed',
      bgContainer: '#ffffff',
      selectedBg: 'rgba(234, 88, 12, 0.11)',
      hoverBg: 'rgba(154, 52, 18, 0.055)',
      tableHeaderBg: '#fff8f2',
      tableHoverBg: 'rgba(234, 88, 12, 0.055)',
    },
    slate: {
      primary: '#4f46e5',
      bgLayout: '#f1f5fb',
      bgContainer: '#ffffff',
      selectedBg: 'rgba(79, 70, 229, 0.10)',
      hoverBg: 'rgba(30, 41, 59, 0.055)',
      tableHeaderBg: '#f8fafc',
      tableHoverBg: 'rgba(79, 70, 229, 0.055)',
    },
  },
  dark: {
    blue: {
      primary: '#60a5fa',
      bgLayout: '#0b1220',
      bgContainer: '#111827',
      selectedBg: 'rgba(96, 165, 250, 0.18)',
      hoverBg: 'rgba(148, 163, 184, 0.10)',
      tableHeaderBg: 'rgba(96, 165, 250, 0.08)',
      tableHoverBg: 'rgba(96, 165, 250, 0.11)',
    },
    emerald: {
      primary: '#34d399',
      bgLayout: '#071612',
      bgContainer: '#10231d',
      selectedBg: 'rgba(52, 211, 153, 0.17)',
      hoverBg: 'rgba(148, 163, 184, 0.10)',
      tableHeaderBg: 'rgba(52, 211, 153, 0.08)',
      tableHoverBg: 'rgba(52, 211, 153, 0.11)',
    },
    cyberpunk: {
      primary: '#f472b6',
      bgLayout: '#170b1f',
      bgContainer: '#24132f',
      selectedBg: 'rgba(244, 114, 182, 0.18)',
      hoverBg: 'rgba(148, 163, 184, 0.10)',
      tableHeaderBg: 'rgba(244, 114, 182, 0.08)',
      tableHoverBg: 'rgba(244, 114, 182, 0.11)',
    },
    sunset: {
      primary: '#fb923c',
      bgLayout: '#1b1009',
      bgContainer: '#27180f',
      selectedBg: 'rgba(251, 146, 60, 0.18)',
      hoverBg: 'rgba(148, 163, 184, 0.10)',
      tableHeaderBg: 'rgba(251, 146, 60, 0.08)',
      tableHoverBg: 'rgba(251, 146, 60, 0.11)',
    },
    slate: {
      primary: '#818cf8',
      bgLayout: '#0f172a',
      bgContainer: '#1e293b',
      selectedBg: 'rgba(129, 140, 248, 0.18)',
      hoverBg: 'rgba(148, 163, 184, 0.10)',
      tableHeaderBg: 'rgba(129, 140, 248, 0.08)',
      tableHoverBg: 'rgba(129, 140, 248, 0.11)',
    },
  },
};

const getPalette = (colorTheme, mode) =>
  themePalettes[mode]?.[colorTheme] || themePalettes[mode].blue;

const allowedModes = ['light', 'dark'];
const allowedColorThemes = ['blue', 'emerald', 'cyberpunk', 'sunset', 'slate'];

const AntAppMessageBridge = ({ children }) => {
  const { message, notification } = AntApp.useApp();

  useEffect(() => {
    setMessageApi(message);
    setNotificationApi(notification);
    return () => {
      setMessageApi(null);
      setNotificationApi(null);
    };
  }, [message, notification]);

  return children;
};

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
    document.body.dataset.themeMode = mode;
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('theme-color', colorTheme);
    document.body.dataset.themeColor = colorTheme;
  }, [colorTheme]);

  const { defaultAlgorithm, darkAlgorithm } = theme;
  const palette = getPalette(colorTheme, mode);
  const isDark = mode === 'dark';

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
            colorPrimary: palette.primary,
            colorSuccess: isDark ? '#22c55e' : '#16a34a',
            colorWarning: isDark ? '#fbbf24' : '#d97706',
            colorError: isDark ? '#fb7185' : '#dc2626',
            colorInfo: isDark ? '#22d3ee' : '#0891b2',
            borderRadius: 10,
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            colorBgLayout: palette.bgLayout,
            colorBgContainer: palette.bgContainer,
            colorTextBase: isDark ? '#f8fafc' : '#111827',
            colorTextSecondary: isDark ? '#cbd5e1' : '#475569',
            colorBorder: isDark ? 'rgba(148, 163, 184, 0.24)' : '#dbe4f0',
            colorBorderSecondary: isDark ? 'rgba(148, 163, 184, 0.16)' : '#edf2f8',
            boxShadow: isDark ? '0 16px 36px rgba(0,0,0,0.30)' : '0 16px 36px rgba(15,23,42,0.10)',
          },
          components: {
            Layout: {
              bodyBg: palette.bgLayout,
              headerBg: palette.bgContainer,
              sidebarBg: palette.bgContainer,
            },
            Menu: {
              itemBg: "transparent",
              itemSelectedBg: palette.selectedBg,
              itemSelectedColor: palette.primary,
              itemHoverBg: palette.hoverBg,
            },
            Card: {
              headerFontSize: 16,
            },
            Table: {
              headerBg: palette.tableHeaderBg,
              rowHoverBg: palette.tableHoverBg,
            },
            Button: {
              controlHeight: 38,
            }
          }
        }}
      >
        <AntApp>
          <AntAppMessageBridge>{children}</AntAppMessageBridge>
        </AntApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
