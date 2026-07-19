import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from 'context/notifications/NotificationProvider';

export const useNotificationsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const { notifications, loading, markOneRead, markAllRead } =
    useNotifications();

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markOneRead(notif.id);
      } catch (error) {
        console.error('Lỗi đánh dấu đã đọc:', error);
      }
    }

    if (notif.relatedType === 'EXAM' && notif.relatedId) {
      navigate(`/exams/${notif.relatedId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead();
    } catch (error) {
      console.error('Lỗi mark all read:', error);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'EXAM') return notif.relatedType === 'EXAM';
    if (filter === 'SYSTEM') return notif.relatedType === 'SYSTEM';
    if (filter === 'MSG')
      return ['PERSONAL_MSG', 'BATCH_MSG'].includes(notif.relatedType);
    return true;
  });

  return {
    filter,
    filteredNotifications,
    handleMarkAllAsRead,
    handleNotificationClick,
    loading,
    setFilter,
  };
};
