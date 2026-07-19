import { getCookieValue, isUnsafeMethod } from './csrf';
import { getStoredLanguage } from 'utils/storage';

export const attachLanguageAndCsrfHeaders = (requestConfig) => {
  const language = getStoredLanguage();
  requestConfig.headers = requestConfig.headers || {};
  requestConfig.headers['Accept-Language'] = language;

  const xsrfToken = getCookieValue('XSRF-TOKEN');
  if (xsrfToken && isUnsafeMethod(requestConfig.method)) {
    requestConfig.headers['X-XSRF-TOKEN'] = xsrfToken;
  }

  return requestConfig;
};
