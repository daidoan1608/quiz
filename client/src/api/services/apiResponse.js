export const getResponseData = (response, fallback) =>
  response?.data?.data ?? response?.data ?? fallback;
