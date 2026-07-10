// context/ThemeProvider.js
import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Khởi tạo Context
const ThemeContext = createContext();

// Hàm tiện ích để lấy mode ban đầu (light/dark) từ localStorage hoặc hệ thống
const getInitialMode = () => {
  if (typeof window !== "undefined" && localStorage.getItem("theme-mode")) {
    return localStorage.getItem("theme-mode");
  }
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
};

// Hàm tiện ích để lấy color theme ban đầu
const getInitialColorTheme = () => {
  if (typeof window !== "undefined" && localStorage.getItem("theme-color")) {
    return localStorage.getItem("theme-color");
  }
  return "blue";
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(getInitialMode);
  const [colorTheme, setColorTheme] = useState(getInitialColorTheme);

  // Đồng bộ mode và colorTheme với DOM (thẻ <html>) và localStorage
  useEffect(() => {
    const root = window.document.documentElement;

    // Bật class transition để chuyển đổi mượt mà
    root.classList.add("theme-transition");

    // Xóa toàn bộ các class mode và theme cũ
    root.classList.remove("light", "dark");
    const colorThemes = ["theme-blue", "theme-emerald", "theme-cyberpunk", "theme-sunset", "theme-slate"];
    colorThemes.forEach((cls) => root.classList.remove(cls));

    // Thêm các class mới tương ứng
    root.classList.add(mode);
    root.classList.add(`theme-${colorTheme}`);

    // Lưu vào localStorage
    localStorage.setItem("theme-mode", mode);
    localStorage.setItem("theme-color", colorTheme);

    // Tắt class transition sau khi hiệu ứng hoàn tất
    const timer = setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 300);

    return () => clearTimeout(timer);
  }, [mode, colorTheme]);

  // Hàm tương thích ngược: toggle giữa light và dark
  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: mode, // Tương thích ngược cho các file gọi `theme === "dark"`
        toggleTheme, // Tương thích ngược cho các file gọi nút bật tắt
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

// Custom Hook để sử dụng theme
export const useTheme = () => useContext(ThemeContext);

