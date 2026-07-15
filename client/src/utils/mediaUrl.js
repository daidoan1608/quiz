const DEFAULT_API_ROOT = "";
const DEFAULT_AVATAR_URL = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export const getApiRoot = () =>
  process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace(/\/api\/v1\/?$/, "")
    : DEFAULT_API_ROOT;

export const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url || "");

export const resolveMediaUrl = (url, baseUrl = getApiRoot()) => {
  if (!url) return "";
  if (url === "/avatars/default.png" || url.endsWith("/avatars/default.png")) {
    return DEFAULT_AVATAR_URL;
  }
  if (isAbsoluteUrl(url)) return url;
  return `${baseUrl || ""}${url.startsWith("/") ? "" : "/"}${url}`;
};
