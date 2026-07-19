import { ADMIN_API_ROOT } from "../config/env";

export const getApiRoot = () => ADMIN_API_ROOT;

export const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url || "");

export const resolveMediaUrl = (url, baseUrl = getApiRoot()) => {
  if (!url) return "";
  if (isAbsoluteUrl(url)) return url;
  return `${baseUrl || ""}${url.startsWith("/") ? "" : "/"}${url}`;
};
