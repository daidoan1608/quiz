import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { message } from "antd";
import { useAuth } from "./AuthProvider";
import { notificationApi } from "api/notificationApi";

const NotificationContext = createContext();

const resolveWebSocketUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL || "/api/v1/";
  if (apiUrl.startsWith("http")) {
    const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
    return `${baseUrl}/ws`;
  }
  return `${window.location.origin}/ws`;
};

export const NotificationProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const stompClientRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(Number(count) || 0);
    } catch (error) {
      console.error("Lỗi khi tải số thông báo chưa đọc:", error);
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
      setUnreadCount(nextNotifications.filter((notification) => !notification.isRead).length);
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const addRealtimeNotification = useCallback((notification) => {
    if (!notification?.id) return;

    let didAdd = false;
    setNotifications((prev) => {
      if (prev.some((item) => item.id === notification.id)) {
        return prev;
      }
      didAdd = true;
      return [{ ...notification, isRead: false }, ...prev];
    });

    if (didAdd) {
      setUnreadCount((count) => Math.max(count + (Number(notification.unreadDelta) || 1), 0));
    }
    message.info(notification.title || "Bạn có thông báo mới");
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    if (!isLoggedIn) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setRealtimeConnected(false);
      return undefined;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(resolveWebSocketUrl()),
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        setRealtimeConnected(true);
        client.subscribe("/user/queue/notifications", (frame) => {
          addRealtimeNotification(JSON.parse(frame.body));
        });
        client.subscribe("/topic/notifications/global", (frame) => {
          addRealtimeNotification(JSON.parse(frame.body));
        });
        fetchNotifications();
        fetchUnreadCount();
      },
      onStompError: (frame) => {
        setRealtimeConnected(false);
        console.error("STOMP error:", frame.headers?.message || frame.body);
      },
      onWebSocketClose: () => {
        setRealtimeConnected(false);
        fetchUnreadCount();
      },
      onWebSocketError: () => {
        setRealtimeConnected(false);
      },
    });

    stompClientRef.current = client;
    client.activate();

    return () => {
      setRealtimeConnected(false);
      client.deactivate();
      if (stompClientRef.current === client) {
        stompClientRef.current = null;
      }
    };
  }, [addRealtimeNotification, fetchNotifications, fetchUnreadCount, isLoggedIn]);

  const markOneRead = useCallback(async (notificationId) => {
    await notificationApi.markOneRead(notificationId);
    setNotifications((prev) =>
      prev.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item))
    );
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const markAllRead = useCallback(async () => {
    await notificationApi.markAllRead();
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        unreadCount,
        realtimeConnected,
        fetchNotifications,
        markOneRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
