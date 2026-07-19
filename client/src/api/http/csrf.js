export const getCookieValue = (name) => {
  if (typeof document === "undefined") return "";
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=")[1] || "") : "";
};

export const isUnsafeMethod = (method = "get") =>
  ["post", "put", "patch", "delete"].includes(method.toLowerCase());
