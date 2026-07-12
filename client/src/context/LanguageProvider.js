import React, { createContext, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { i18n, t: translate } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "vi";

  const toggleLanguage = () => {
    const nextLanguage = language === "vi" ? "en" : "vi";
    localStorage.setItem("appLanguage", nextLanguage);
    i18n.changeLanguage(nextLanguage);
  };

  const t = (key, optionsOrFallback, maybeOptions) => {
    if (typeof optionsOrFallback === "string") {
      return translate(key, { defaultValue: optionsOrFallback, ...(maybeOptions || {}) });
    }
    return translate(key, optionsOrFallback);
  };

  const texts = useMemo(
    () =>
      new Proxy(
        {},
        {
          get: (_target, key) => {
            if (typeof key !== "string") return undefined;
            return translate(key, { defaultValue: key });
          },
        }
      ),
    [translate]
  );

  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, t, texts }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
