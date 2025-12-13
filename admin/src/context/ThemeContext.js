// context/ThemeContext.js
import React, { createContext, useContext, useState } from 'react';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 1. Lấy trạng thái từ localStorage (nếu có)
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('appTheme') || 'light';
  });

  // 2. Hàm chuyển đổi
  const toggleTheme = () => {
    setCurrentTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('appTheme', newTheme); // Lưu vào localStorage
      return newTheme;
    });
  };

  // 3. Cấu hình Antd
  const { defaultAlgorithm, darkAlgorithm } = theme;

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      <ConfigProvider
        theme={{
          // Tự động chuyển thuật toán màu của Antd
          algorithm: currentTheme === 'dark' ? darkAlgorithm : defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

// Export hook để dùng ở các component con
export const useTheme = () => useContext(ThemeContext);