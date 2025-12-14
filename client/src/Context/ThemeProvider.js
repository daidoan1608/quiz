// context/ThemeProvider.js
import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Khởi tạo Context
const ThemeContext = createContext();

// Hàm tiện ích để lấy theme ban đầu từ localStorage hoặc hệ thống
const getInitialTheme = () => {
  // 1. Kiểm tra localStorage
  if (typeof window !== "undefined" && localStorage.getItem("theme")) {
    return localStorage.getItem("theme");
  }
  // 2. Kiểm tra cài đặt hệ thống (ưu tiên dark mode)
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  // 3. Mặc định là light
  return "light";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  // 2. useEffect: Đồng bộ trạng thái theme với DOM (thẻ <html>) và localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === "dark";

    // Cập nhật DOM
    root.classList.remove(isDark ? "light" : "dark");
    root.classList.add(theme);

    // Cập nhật localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 3. Hàm chuyển đổi theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 4. Custom Hook để sử dụng theme
export const useTheme = () => useContext(ThemeContext);
