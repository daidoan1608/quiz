const DEFAULT_API_ROOT = "http://localhost:8080";

export const getApiRoot = () =>
  process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace(/\/api\/v1\/?$/, "")
    : DEFAULT_API_ROOT;

export const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url || "");

export const resolveMediaUrl = (url, baseUrl = getApiRoot()) => {
  if (!url) return "";
  if (isAbsoluteUrl(url)) return url;
  return `${baseUrl || ""}${url.startsWith("/") ? "" : "/"}${url}`;
};
