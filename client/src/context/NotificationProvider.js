import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { message } from "antd";
import { useAuth } from "./AuthProvider";
import { notificationApi } from "api/notificationApi";

const NotificationContext = createContext();

const resolveWebSocketUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL || "/api/v1/";
  if (apiUrl.startsWith("http")) {
    const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
    return baseUrl.replace(/^http/, "ws") + "/ws";
  }
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws`;
};

export const NotificationProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const stompClientRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const data = await notificationApi.getAll();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const addRealtimeNotification = useCallback((notification) => {
    if (!notification?.id) return;
    setNotifications((prev) => {
      if (prev.some((item) => item.id === notification.id)) {
        return prev;
      }
      return [{ ...notification, isRead: false }, ...prev];
    });
    message.info(notification.title || "Bạn có thông báo mới");
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!isLoggedIn) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      return undefined;
    }

    const client = new Client({
      brokerURL: resolveWebSocketUrl(),
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        client.subscribe("/user/queue/notifications", (frame) => {
          addRealtimeNotification(JSON.parse(frame.body));
        });
        client.subscribe("/topic/notifications/global", (frame) => {
          addRealtimeNotification(JSON.parse(frame.body));
        });
        fetchNotifications();
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers?.message || frame.body);
      },
    });

    stompClientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
      if (stompClientRef.current === client) {
        stompClientRef.current = null;
      }
    };
  }, [addRealtimeNotification, fetchNotifications, isLoggedIn]);

  const markOneRead = useCallback(async (notificationId) => {
    await notificationApi.markOneRead(notificationId);
    setNotifications((prev) =>
      prev.map((item) => item.id === notificationId ? { ...item, isRead: true } : item)
    );
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationApi.markAllRead();
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        unreadCount,
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
