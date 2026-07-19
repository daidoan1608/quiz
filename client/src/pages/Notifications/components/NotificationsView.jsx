import React from 'react';
import { NotificationList } from './NotificationList';
import { NotificationTabs } from './NotificationTabs';

export const NotificationsView = ({
  filter,
  filteredNotifications,
  handleMarkAllAsRead,
  handleNotificationClick,
  loading,
  setFilter,
}) => (
  <main className="flex flex-1 justify-center py-6 px-4">
    <div className="flex flex-col w-full max-w-3xl gap-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Cập nhật mới
        </h2>
        <button
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-bold text-gray-800 dark:text-gray-200"
        >
          <span className="material-symbols-outlined text-lg">done_all</span>
          <span>Đọc tất cả</span>
        </button>
      </div>

      <NotificationTabs filter={filter} setFilter={setFilter} />
      <NotificationList
        filteredNotifications={filteredNotifications}
        loading={loading}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  </main>
);
