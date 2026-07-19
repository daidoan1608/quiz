import React from 'react';
import { formatTime, getIconInfo } from '../utils/notificationFormatters';

export const NotificationList = ({
  filteredNotifications,
  loading,
  onNotificationClick,
}) => (
  <div className="flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
    {loading ? (
      <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
    ) : filteredNotifications.length === 0 ? (
      <div className="flex flex-col items-center justify-center p-10 text-gray-400 gap-2">
        <span className="material-symbols-outlined text-5xl opacity-50">
          notifications_off
        </span>
        <p>Không có thông báo nào.</p>
      </div>
    ) : (
      filteredNotifications.map((notif, index) => {
        const isUnread = !notif.isRead;
        const { icon, color, label } = getIconInfo(notif.relatedType);

        return (
          <div key={notif.id}>
            <div
              className={`relative flex gap-4 p-4 transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 ${isUnread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
              onClick={() => onNotificationClick(notif)}
            >
              {isUnread && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
              )}

              <div
                className={`shrink-0 flex items-center justify-center size-12 rounded-full ${color}`}
              >
                <span className="material-symbols-outlined">{icon}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <p
                    className={`text-base truncate pr-2 text-gray-900 dark:text-white ${isUnread ? 'font-bold' : 'font-medium'}`}
                  >
                    {notif.title}
                  </p>
                  <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                    {formatTime(notif.createdAt)}
                  </span>
                </div>

                <p
                  className={`text-sm text-gray-600 dark:text-gray-300 line-clamp-2 ${isUnread ? 'font-medium' : 'font-normal'}`}
                >
                  {notif.message}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                    {label}
                  </span>
                </div>
              </div>

              {isUnread && (
                <div className="shrink-0 pt-2">
                  <div className="size-2.5 bg-blue-600 rounded-full ring-2 ring-white dark:ring-gray-900"></div>
                </div>
              )}
            </div>

            {index < filteredNotifications.length - 1 && (
              <hr className="border-gray-100 dark:border-gray-800 mx-4" />
            )}
          </div>
        );
      })
    )}
  </div>
);
