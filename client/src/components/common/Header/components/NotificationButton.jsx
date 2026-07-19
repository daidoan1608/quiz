import React from 'react';
import HeaderIconButton from './HeaderIconButton';

const NotificationButton = ({ navigate, unreadCount }) => (
  <HeaderIconButton
    className="relative"
    onClick={() => navigate('/notifications')}
  >
    <span className="material-symbols-outlined text-xl">notifications</span>
    {unreadCount > 0 && (
      <span className="absolute right-1 top-1 h-4 min-w-4 rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    )}
  </HeaderIconButton>
);

export default NotificationButton;
