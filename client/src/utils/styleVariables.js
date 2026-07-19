export const progressValueStyle = (value) => ({
  '--aura-progress-value': `${value}%`,
});

export const swatchColorStyle = (color) => ({
  '--aura-swatch-color': color,
});

export const headerNavPillStyle = ({ left, opacity, width }) => ({
  '--header-nav-pill-left': `${left}px`,
  '--header-nav-pill-opacity': opacity,
  '--header-nav-pill-width': `${width}px`,
});
