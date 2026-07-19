import { THEME_COLOR_NAMES } from 'context/theme/themeConstants';

const THEME_COLOR_SWATCHES = {
  blue: '#0058be',
  emerald: '#059669',
  cyberpunk: '#be185d',
  sunset: '#ea580c',
  slate: '#4f46e5',
};

export const createThemeColorOptions = (t) => [
  ...THEME_COLOR_NAMES.map((name) => ({
    name,
    color: THEME_COLOR_SWATCHES[name],
    label: t(`theme.colorLabel.${name}`),
  })),
];
