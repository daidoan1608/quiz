import React, { createContext, useState, useEffect } from 'react';

// Tên key lưu trong Local Storage
const THEME_STORAGE_KEY = 'quiz_admin_theme';

// 1. Tạo Context Object
// Đây là đối tượng Context mà hook useTheme sẽ sử dụng
export const ThemeContext = createContext(null);

// 2. Tạo Theme Provider Component (Quản lý State và Logic)
export const ThemeProvider = ({ children }) => {
  // Lấy theme đã lưu hoặc mặc định là 'light'
  const initialTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
  const [theme, setTheme] = useState(initialTheme);

  // Hàm chuyển đổi theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // 3. Effect để lưu trạng thái và áp dụng class CSS
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.body.className = theme; 
  }, [theme]);

  const themeContextValue = {
    theme,           // Trạng thái theme hiện tại ('light' hoặc 'dark')
    toggleTheme,     // Hàm để chuyển đổi theme
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};