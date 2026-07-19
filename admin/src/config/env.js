const env = import.meta.env || {};

export const ADMIN_API_URL = env.VITE_API_URL || "/api/v1/";
export const ADMIN_BASENAME = env.VITE_ADMIN_BASENAME || "/";

export const ADMIN_API_ROOT = ADMIN_API_URL.replace(/\/api\/v1\/?$/, "");
