export const THEME_MODE_STORAGE_KEY = 'theme-mode';
export const THEME_COLOR_STORAGE_KEY = 'theme-color';

export const THEME_COLOR_NAMES = [
  'blue',
  'emerald',
  'cyberpunk',
  'sunset',
  'slate',
];

export const THEME_COLOR_CLASSES = THEME_COLOR_NAMES.map(
  (colorName) => `theme-${colorName}`
);
