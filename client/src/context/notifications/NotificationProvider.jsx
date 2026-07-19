import React, { createContext, useContext } from 'react';
import { useAuth } from 'context/auth/AuthProvider';
import NotificationPopup from './NotificationPopup';
import { useNotificationPopup } from './useNotificationPopup';
import { useNotificationRealtime } from './useNotificationRealtime';
import { useNotificationState } from './useNotificationState';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const {
    closePopupNotification,
    popupNotification,
    showPopupNotification,
  } = useNotificationPopup();
  const notificationState = useNotificationState({
    isLoggedIn,
    onRealtimeNotification: showPopupNotification,
  });
  const { realtimeConnected } = useNotificationRealtime({
    addRealtimeNotification: notificationState.addRealtimeNotification,
    fetchNotifications: notificationState.fetchNotifications,
    fetchUnreadCount: notificationState.fetchUnreadCount,
    isLoggedIn,
  });

  return (
    <NotificationContext.Provider
      value={{
        notifications: notificationState.notifications,
        loading: notificationState.loading,
        unreadCount: notificationState.unreadCount,
        realtimeConnected,
        fetchNotifications: notificationState.fetchNotifications,
        markOneRead: notificationState.markOneRead,
        markAllRead: notificationState.markAllRead,
      }}
    >
      {children}
      <NotificationPopup
        notification={popupNotification}
        onClose={closePopupNotification}
      />
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
