let messageApi = null;

export const setMessageApi = (api) => {
  messageApi = api;
};

const showMessage = (type, ...args) => {
  if (!messageApi?.[type]) return;
  messageApi[type](...args);
};

export const appMessage = {
  success: (...args) => showMessage("success", ...args),
  error: (...args) => showMessage("error", ...args),
  warning: (...args) => showMessage("warning", ...args),
  info: (...args) => showMessage("info", ...args),
};
