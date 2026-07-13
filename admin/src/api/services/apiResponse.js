export const unwrapApiData = (response, fallback = []) => {
  const payload = response?.data;

  if (payload && Object.prototype.hasOwnProperty.call(payload, "data")) {
    return payload.data ?? fallback;
  }

  return payload ?? fallback;
};

export const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return Array.isArray(value[0]) ? value[0] : value;
  }
  return [value];
};
