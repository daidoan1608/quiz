import React, { createContext, useContext } from "react";
import { useTranslation } from "react-i18next";
import vi from "../languages/vi";
import en from "../languages/en";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { i18n, t: translate } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "vi";

  const toggleLanguage = () => {
    const nextLanguage = language === "vi" ? "en" : "vi";
    localStorage.setItem("appLanguage", nextLanguage);
    i18n.changeLanguage(nextLanguage);
  };

  const legacyTexts = language === "en" ? en : vi;
  const t = (key, optionsOrFallback, maybeOptions) => {
    if (typeof optionsOrFallback === "string") {
      return translate(key, { defaultValue: optionsOrFallback, ...(maybeOptions || {}) });
    }
    return translate(key, optionsOrFallback);
  };

  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, t, texts: legacyTexts }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
