import React, { useEffect, useRef, useState } from 'react';
import { appMessageEvents } from 'utils/appMessage';

const DEFAULT_DURATION = 3000;

const MESSAGE_ICON = {
  error: 'error',
  info: 'info',
  loading: 'progress_activity',
  success: 'check_circle',
  warning: 'warning',
};

const normalizeDuration = (duration, type) => {
  if (duration === 0) {
    return 0;
  }

  if (typeof duration === 'number') {
    return duration * 1000;
  }

  return type === 'loading' ? 0 : DEFAULT_DURATION;
};

export const AppMessageHost = () => {
  const [messages, setMessages] = useState([]);
  const closeCallbacksRef = useRef(new Map());
  const timersRef = useRef(new Map());

  useEffect(() => {
    const clearMessageTimer = (key) => {
      const timer = timersRef.current.get(key);

      if (timer) {
        window.clearTimeout(timer);
        timersRef.current.delete(key);
      }
    };

    const closeMessage = (key) => {
      clearMessageTimer(key);
      setMessages((prev) => prev.filter((message) => message.key !== key));

      const onClose = closeCallbacksRef.current.get(key);
      closeCallbacksRef.current.delete(key);
      onClose?.();
    };

    const showMessage = (event) => {
      const detail = event.detail || {};
      const durationMs = normalizeDuration(detail.duration, detail.type);
      const nextMessage = {
        content: detail.content,
        key: detail.key,
        type: detail.type || 'info',
      };

      if (!nextMessage.key || !nextMessage.content) {
        return;
      }

      clearMessageTimer(nextMessage.key);

      if (typeof detail.onClose === 'function') {
        closeCallbacksRef.current.set(nextMessage.key, detail.onClose);
      }

      setMessages((prev) => {
        const withoutDuplicate = prev.filter(
          (message) => message.key !== nextMessage.key
        );

        return [nextMessage, ...withoutDuplicate].slice(0, 4);
      });

      if (durationMs > 0) {
        const timer = window.setTimeout(
          () => closeMessage(nextMessage.key),
          durationMs
        );
        timersRef.current.set(nextMessage.key, timer);
      }
    };

    const closeMessageFromEvent = (event) => {
      const key = event.detail?.key;

      if (key) {
        closeMessage(key);
      }
    };

    const destroyMessages = (event) => {
      const key = event.detail?.key;

      if (key) {
        closeMessage(key);
        return;
      }

      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
      closeCallbacksRef.current.clear();
      setMessages([]);
    };

    window.addEventListener(appMessageEvents.show, showMessage);
    window.addEventListener(appMessageEvents.close, closeMessageFromEvent);
    window.addEventListener(appMessageEvents.destroy, destroyMessages);

    return () => {
      window.removeEventListener(appMessageEvents.show, showMessage);
      window.removeEventListener(appMessageEvents.close, closeMessageFromEvent);
      window.removeEventListener(appMessageEvents.destroy, destroyMessages);
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
      closeCallbacksRef.current.clear();
    };
  }, []);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="aura-message-host" aria-live="polite" aria-relevant="additions">
      {messages.map((message) => (
        <div
          className={`aura-message-toast aura-message-toast--${message.type}`}
          key={message.key}
          role={message.type === 'error' ? 'alert' : 'status'}
        >
          <span className="material-symbols-outlined aura-message-toast__icon">
            {MESSAGE_ICON[message.type] || MESSAGE_ICON.info}
          </span>
          <span className="aura-message-toast__content">{message.content}</span>
        </div>
      ))}
    </div>
  );
};
