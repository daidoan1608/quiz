import React from 'react';
import { NotificationsView } from './components/NotificationsView';
import { useNotificationsPage } from './hooks/useNotificationsPage';

export default function Notifications() {
  const notificationsPage = useNotificationsPage();

  return <NotificationsView {...notificationsPage} />;
}
