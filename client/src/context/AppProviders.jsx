import React from 'react';
import { AuthProvider } from './auth/AuthProvider';
import { FavoritesProvider } from './favorites/FavoritesContext';
import { LanguageProvider } from './language/LanguageProvider';
import { NotificationProvider } from './notifications/NotificationProvider';
import { ThemeProvider } from './theme/ThemeProvider';

export const AppProviders = ({ children }) => (
  <LanguageProvider>
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  </LanguageProvider>
);
