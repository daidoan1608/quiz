import { CLIENT_API_URL } from 'config/env';

export const API_BASE_URL = CLIENT_API_URL;

export const createAxiosConfig = () => ({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});
