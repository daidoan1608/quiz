import { useCallback, useEffect, useState } from 'react';
import { notificationApi } from 'api/services/notificationApi';

export const useNotificationState = ({ isLoggedIn, onRealtimeNotification }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(Number(count) || 0);
    } catch (error) {
      console.error('Lỗi khi tải số thông báo chưa đọc:', error);
    }
  }, [isLoggedIn]);

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const data = await notificationApi.getAll();
      const nextNotifications = Array.isArray(data) ? data : [];
      setNotifications(nextNotifications);
      setUnreadCount(
        nextNotifications.filter((notification) => !notification.isRead).length
      );
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const addRealtimeNotification = useCallback(
    (notification) => {
      if (!notification?.id) {
        return;
      }

      let didAdd = false;
      setNotifications((prev) => {
        if (prev.some((item) => item.id === notification.id)) {
          return prev;
        }
        didAdd = true;
        return [{ ...notification, isRead: false }, ...prev];
      });

      if (didAdd) {
        setUnreadCount((count) =>
          Math.max(count + (Number(notification.unreadDelta) || 1), 0)
        );
      }

      onRealtimeNotification?.(notification);
    },
    [onRealtimeNotification]
  );

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const markOneRead = useCallback(
    async (notificationId) => {
      await notificationApi.markOneRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item
        )
      );
      fetchUnreadCount();
    },
    [fetchUnreadCount]
  );

  const markAllRead = useCallback(async () => {
    await notificationApi.markAllRead();
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  }, []);

  return {
    addRealtimeNotification,
    fetchNotifications,
    fetchUnreadCount,
    loading,
    markAllRead,
    markOneRead,
    notifications,
    unreadCount,
  };
};
