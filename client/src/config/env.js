const env = import.meta.env || {};

export const CLIENT_API_URL = env.VITE_API_URL || '/api/v1/';
export const CLIENT_AVATAR_URL = env.VITE_AVATAR_URL || '';
export const CLIENT_BASENAME = env.VITE_CLIENT_BASENAME || '/';
export const GOOGLE_CLIENT_ID = env.VITE_GOOGLE_CLIENT_ID || '';

export const CLIENT_API_ROOT = CLIENT_API_URL.replace(/\/api\/v1\/?$/, '');
