import React, { createContext, useContext, useState, useEffect } from "react";
import vi from "../../Languages/vi";
import en from "../../Languages/en";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Lấy ngôn ngữ đã lưu hoặc mặc định là 'vi'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("appLanguage") || "vi";
  });

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "vi" ? "en" : "vi"));
  };

  // Cập nhật localStorage khi language thay đổi
  useEffect(() => {
    localStorage.setItem("appLanguage", language);
  }, [language]);

  const texts = {
    vi,
    en,
  };

  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, texts: texts[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
