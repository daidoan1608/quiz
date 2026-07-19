import { THEME_COLOR_CLASSES } from './themeConstants';
import { persistThemePreference } from './themeStorage';

export const applyThemeToDom = ({ colorTheme, mode }) => {
  const root = window.document.documentElement;

  root.classList.add('theme-transition');
  root.classList.remove('light', 'dark');
  THEME_COLOR_CLASSES.forEach((className) => root.classList.remove(className));

  root.classList.add(mode);
  root.classList.add(`theme-${colorTheme}`);
  persistThemePreference({ colorTheme, mode });

  return window.setTimeout(() => {
    root.classList.remove('theme-transition');
  }, 300);
};
