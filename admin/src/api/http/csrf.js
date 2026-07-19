export const getCookieValue = (name) => {
  if (typeof document === "undefined") return "";
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=")[1] || "") : "";
};

export const isUnsafeMethod = (method = "get") =>
  ["post", "put", "patch", "delete"].includes(method.toLowerCase());

export const attachCsrfHeader = (requestConfig) => {
  requestConfig.headers = requestConfig.headers || {};
  const xsrfToken = getCookieValue("XSRF-TOKEN");
  if (xsrfToken && isUnsafeMethod(requestConfig.method)) {
    requestConfig.headers["X-XSRF-TOKEN"] = xsrfToken;
  }
  return requestConfig;
};
