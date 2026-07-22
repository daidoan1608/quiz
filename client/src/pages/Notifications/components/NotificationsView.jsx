import React from 'react';
import { PageContainer } from 'components/common/PageContainer';
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
  <PageContainer className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Cập nhật mới
        </h2>
        <button
          onClick={handleMarkAllAsRead}
          className="aura-button aura-button-subtle min-h-0 px-4 py-2 text-sm"
          type="button"
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
  </PageContainer>
);
