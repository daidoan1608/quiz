const APP_MESSAGE_SHOW_EVENT = 'aura:message:show';
const APP_MESSAGE_CLOSE_EVENT = 'aura:message:close';
const APP_MESSAGE_DESTROY_EVENT = 'aura:message:destroy';

let messageId = 0;

const dispatchAppMessageEvent = (eventName, detail = {}) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};

const normalizeContent = (content) => {
  if (content && typeof content === 'object' && 'content' in content) {
    return content;
  }

  return { content };
};

const createCloseHandle = (key) => {
  const close = () => {
    dispatchAppMessageEvent(APP_MESSAGE_CLOSE_EVENT, { key });
  };

  close.then = (onFulfilled) => Promise.resolve(true).then(onFulfilled);
  close.promise = Promise.resolve(true);

  return close;
};

const openAppMessage = (type, content, duration, onClose) => {
  const config = normalizeContent(content);
  const key = config.key ?? `aura-message-${messageId += 1}`;

  dispatchAppMessageEvent(APP_MESSAGE_SHOW_EVENT, {
    ...config,
    duration,
    key,
    onClose,
    type,
  });

  return createCloseHandle(key);
};

export const appMessageEvents = {
  close: APP_MESSAGE_CLOSE_EVENT,
  destroy: APP_MESSAGE_DESTROY_EVENT,
  show: APP_MESSAGE_SHOW_EVENT,
};

export const appMessage = {
  destroy: (key) => dispatchAppMessageEvent(APP_MESSAGE_DESTROY_EVENT, { key }),
  error: (content, duration, onClose) =>
    openAppMessage('error', content, duration, onClose),
  info: (content, duration, onClose) =>
    openAppMessage('info', content, duration, onClose),
  loading: (content, duration, onClose) =>
    openAppMessage('loading', content, duration, onClose),
  success: (content, duration, onClose) =>
    openAppMessage('success', content, duration, onClose),
  warning: (content, duration, onClose) =>
    openAppMessage('warning', content, duration, onClose),
};
