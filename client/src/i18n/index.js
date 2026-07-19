import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getStoredLanguage } from "utils/storage";
import { i18nResources } from "./resources";

const savedLanguage = getStoredLanguage();

i18n.use(initReactI18next).init({
  resources: i18nResources,
  lng: savedLanguage,
  fallbackLng: "vi",
  ns: ["common"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
  returnEmptyString: false,
});

export default i18n;
