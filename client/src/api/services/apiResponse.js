export const getResponseData = (response, fallback) =>
  response?.data?.data ?? response?.data ?? fallback;

export const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.content)) return value.content;
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.results)) return value.results;
  if (Array.isArray(value.subjects)) return value.subjects;
  return [];
};
