import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { CLIENT_API_URL } from 'config/env';

export const resolveWebSocketUrl = () => {
  const apiUrl = CLIENT_API_URL;

  if (apiUrl.startsWith('http')) {
    const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
    return `${baseUrl}/ws`;
  }

  return `${window.location.origin}/ws`;
};

export const createNotificationClient = ({
  onConnect,
  onStompError,
  onWebSocketClose,
  onWebSocketError,
}) =>
  new Client({
    webSocketFactory: () => new SockJS(resolveWebSocketUrl()),
    reconnectDelay: 5000,
    debug: () => {},
    onConnect: () => {
      onConnect?.();
    },
    onStompError,
    onWebSocketClose,
    onWebSocketError,
  });

export const subscribeNotificationTopics = (client, onMessage) => {
  client.subscribe('/user/queue/notifications', (frame) => {
    onMessage(JSON.parse(frame.body));
  });
  client.subscribe('/topic/notifications/global', (frame) => {
    onMessage(JSON.parse(frame.body));
  });
};
