const clampPercent = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.min(100, Math.max(0, numericValue));
};

export const progressValueStyle = (value) => ({
  '--aura-progress-value': `${clampPercent(value)}%`,
});

const progressToneColors = {
  danger: '#ef4444',
  primary: 'var(--aura-primary)',
  success: '#10b981',
  warning: '#f59e0b',
};

export const progressBarStyle = ({ tone = 'primary', value }) => ({
  ...progressValueStyle(value),
  '--aura-progress-fill': progressToneColors[tone] || progressToneColors.primary,
});

export const swatchColorStyle = (color) => ({
  '--aura-swatch-color': color,
});

export const headerNavPillStyle = ({ left, opacity, width }) => ({
  '--header-nav-pill-left': `${left}px`,
  '--header-nav-pill-opacity': opacity,
  '--header-nav-pill-width': `${width}px`,
});
