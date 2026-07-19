export const textOrFallback = (texts, key, fallback) => {
  const value = texts?.[key];
  return value && value !== key ? value : fallback;
};
