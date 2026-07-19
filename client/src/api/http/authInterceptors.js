import {
  createCsrfRetryHandler,
  createUnauthorizedRetryHandler,
  handleForbiddenResponse,
} from './authResponseHandlers';
export { EXPLICIT_LOGOUT_KEY } from './explicitLogout';
import { createRefreshQueue } from './refreshQueue';

export const attachAuthResponseInterceptor = ({ authAxios, publicAxios }) => {
  const refreshQueue = createRefreshQueue();
  const handleCsrfRetry = createCsrfRetryHandler({ authAxios, publicAxios });
  const handleUnauthorizedRetry = createUnauthorizedRetryHandler({
    authAxios,
    publicAxios,
    refreshQueue,
  });

  authAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (!originalRequest || originalRequest._retry) {
        return Promise.reject(error);
      }

      const status = error.response?.status;

      const csrfRetryResponse = await handleCsrfRetry(error, originalRequest);
      if (csrfRetryResponse) {
        return csrfRetryResponse;
      }

      if (status === 403) {
        return handleForbiddenResponse(error);
      }

      if (status === 401) {
        return handleUnauthorizedRetry(error, originalRequest);
      }

      return Promise.reject(error);
    }
  );
};
