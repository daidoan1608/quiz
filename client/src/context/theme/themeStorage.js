import { getStorageItem, setStorageItem } from 'utils/storage';
import {
  THEME_COLOR_STORAGE_KEY,
  THEME_MODE_STORAGE_KEY,
} from './themeConstants';

export const getInitialMode = () => {
  const storedMode = getStorageItem(THEME_MODE_STORAGE_KEY);
  if (storedMode) {
    return storedMode;
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
  const storedColorTheme = getStorageItem(THEME_COLOR_STORAGE_KEY);
  if (storedColorTheme) {
    return storedColorTheme;
  }

  return 'blue';
};

export const persistThemePreference = ({ colorTheme, mode }) => {
  setStorageItem(THEME_MODE_STORAGE_KEY, mode);
  setStorageItem(THEME_COLOR_STORAGE_KEY, colorTheme);
};
