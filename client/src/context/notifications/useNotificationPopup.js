import { useCallback, useEffect, useRef, useState } from 'react';

export const useNotificationPopup = () => {
  const [popupNotification, setPopupNotification] = useState(null);
  const popupTimerRef = useRef(null);

  const showPopupNotification = useCallback((notification) => {
    setPopupNotification(notification);
  }, []);

  const closePopupNotification = useCallback(() => {
    setPopupNotification(null);
  }, []);

  useEffect(() => {
    if (!popupNotification) {
      return undefined;
    }

    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }

    popupTimerRef.current = setTimeout(() => {
      setPopupNotification(null);
    }, 6000);

    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, [popupNotification]);

  return {
    closePopupNotification,
    popupNotification,
    showPopupNotification,
  };
};
