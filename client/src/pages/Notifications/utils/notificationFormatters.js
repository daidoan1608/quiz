const notificationTypeInfo = {
  BATCH_MSG: {
    icon: 'groups',
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    label: 'Thông báo lớp',
  },
  EXAM: {
    icon: 'assignment',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    label: 'Đề thi',
  },
  PERSONAL_MSG: {
    icon: 'person',
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
    label: 'Cá nhân',
  },
  SYSTEM: {
    icon: 'dns',
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    label: 'Hệ thống',
  },
};

const defaultNotificationTypeInfo = {
  icon: 'notifications',
  color: 'text-gray-600 bg-gray-200 dark:bg-gray-800',
  label: 'Thông báo',
};

export const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
};

export const getIconInfo = (relatedType) =>
  notificationTypeInfo[relatedType] || defaultNotificationTypeInfo;
