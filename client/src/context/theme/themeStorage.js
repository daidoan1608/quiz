import {
  THEME_COLOR_STORAGE_KEY,
  THEME_MODE_STORAGE_KEY,
} from './themeConstants';

export const getInitialMode = () => {
  if (typeof window !== 'undefined' && localStorage.getItem(THEME_MODE_STORAGE_KEY)) {
    return localStorage.getItem(THEME_MODE_STORAGE_KEY);
  }

  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
};

export const getInitialColorTheme = () => {
  if (typeof window !== 'undefined' && localStorage.getItem(THEME_COLOR_STORAGE_KEY)) {
    return localStorage.getItem(THEME_COLOR_STORAGE_KEY);
  }

  return 'blue';
};

export const persistThemePreference = ({ colorTheme, mode }) => {
  localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  localStorage.setItem(THEME_COLOR_STORAGE_KEY, colorTheme);
};
