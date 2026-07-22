import { appMessage } from 'utils/appMessage';
import { getApiErrorMessage } from './apiError';
import { getCookieValue, isUnsafeMethod } from './csrf';
import { isExplicitLogoutInProgress } from './explicitLogout';

export const createCsrfRetryHandler =
  ({ authAxios, publicAxios }) =>
  async (error, originalRequest) => {
    if (
      error.response?.status !== 403 ||
      !isUnsafeMethod(originalRequest.method) ||
      originalRequest._csrfRetry
    ) {
      return null;
    }

    originalRequest._csrfRetry = true;

    try {
      await publicAxios.get('/auth/me');
      const xsrfToken = getCookieValue('XSRF-TOKEN');

      if (!xsrfToken) {
        return null;
      }

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers['X-XSRF-TOKEN'] = xsrfToken;
      return authAxios(originalRequest);
    } catch (csrfError) {
      return Promise.reject(error);
    }
  };

export const handleForbiddenResponse = (error) => {
  appMessage.error(
    getApiErrorMessage(error, 'Bạn không có quyền thực hiện thao tác này!')
  );
  return Promise.reject(error);
};

export const createUnauthorizedRetryHandler =
  ({ authAxios, publicAxios, refreshQueue }) =>
  async (error, originalRequest) => {
    if (refreshQueue.isRefreshing) {
      return refreshQueue
        .enqueueRequest()
        .then(() => authAxios(originalRequest))
        .catch((queueError) => Promise.reject(queueError));
    }

    originalRequest._retry = true;
    refreshQueue.setRefreshing(true);

    try {
      await publicAxios.post('/auth/refresh');
      refreshQueue.processQueue(null);
      return authAxios(originalRequest);
    } catch (refreshError) {
      refreshQueue.processQueue(refreshError);

      if (!isExplicitLogoutInProgress()) {
        appMessage.error(
          getApiErrorMessage(
            refreshError,
            'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!'
          )
        );
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    } finally {
      refreshQueue.setRefreshing(false);
    }
  };

