// src/context/AppProviders.jsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./AuthProvider"; // Đường dẫn tuỳ chỉnh lại theo file của bạn
import { FavoritesProvider } from "./FavoritesContext";
import { LanguageProvider } from "./LanguageProvider";
import { NotificationProvider } from "./NotificationProvider";

export const AppProviders = ({ children }) => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <FavoritesProvider>
          <NotificationProvider>
            <Router>
              {children}
            </Router>
          </NotificationProvider>
        </FavoritesProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};
