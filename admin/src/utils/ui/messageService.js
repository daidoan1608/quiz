let messageApi = null;
let notificationApi = null;

export const setMessageApi = (api) => {
  messageApi = api;
};

export const setNotificationApi = (api) => {
  notificationApi = api;
};

const normalizeNotice = (type, args) => {
  const firstArg = args[0];
  if (firstArg && typeof firstArg === "object") {
    return {
      placement: "bottomRight",
      duration: type === "error" ? 4.5 : 3,
      ...firstArg,
      className: ["admin-toast-notice", firstArg.className].filter(Boolean).join(" "),
    };
  }

  return {
    message: firstArg,
    description: args[1],
    placement: "bottomRight",
    duration: type === "error" ? 4.5 : 3,
    className: "admin-toast-notice",
  };
};

const showMessage = (type, ...args) => {
  if (notificationApi?.[type]) {
    notificationApi[type](normalizeNotice(type, args));
    return;
  }
  if (!messageApi?.[type]) return;
  messageApi[type](...args);
};

export const appMessage = {
  success: (...args) => showMessage("success", ...args),
  error: (...args) => showMessage("error", ...args),
  warning: (...args) => showMessage("warning", ...args),
  info: (...args) => showMessage("info", ...args),
};
