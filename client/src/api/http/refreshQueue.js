export const createRefreshQueue = () => {
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error) => {
    failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });
    failedQueue = [];
  };

  const enqueueRequest = () =>
    new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });

  return {
    enqueueRequest,
    get isRefreshing() {
      return isRefreshing;
    },
    processQueue,
    setRefreshing(nextValue) {
      isRefreshing = nextValue;
    },
  };
};
