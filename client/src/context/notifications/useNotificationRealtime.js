import { useEffect, useRef, useState } from 'react';
import {
  createNotificationClient,
  subscribeNotificationTopics,
} from './notificationRealtime';

export const useNotificationRealtime = ({
  addRealtimeNotification,
  fetchNotifications,
  fetchUnreadCount,
  isLoggedIn,
}) => {
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const stompClientRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setRealtimeConnected(false);
      return undefined;
    }

    const client = createNotificationClient({
      onConnect: () => {
        setRealtimeConnected(true);
        subscribeNotificationTopics(client, addRealtimeNotification);
        fetchNotifications();
        fetchUnreadCount();
      },
      onStompError: (frame) => {
        setRealtimeConnected(false);
        console.error('STOMP error:', frame.headers?.message || frame.body);
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

  return { realtimeConnected };
};
