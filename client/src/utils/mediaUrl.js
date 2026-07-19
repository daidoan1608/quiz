import { CLIENT_API_ROOT } from 'config/env';

const DEFAULT_API_ROOT = "";
const DEFAULT_AVATAR_URL = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export const getApiRoot = () => CLIENT_API_ROOT || DEFAULT_API_ROOT;

export const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url || "");

export const resolveMediaUrl = (url, baseUrl = getApiRoot()) => {
  if (!url) return "";
  if (url === "/avatars/default.png" || url.endsWith("/avatars/default.png")) {
    return DEFAULT_AVATAR_URL;
  }
  if (isAbsoluteUrl(url)) return url;
  return `${baseUrl || ""}${url.startsWith("/") ? "" : "/"}${url}`;
};
