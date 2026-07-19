import React from 'react';

export default function NotificationPopup({ notification, onClose }) {
  if (!notification) {
    return null;
  }

  return (
    <div className="client-notification-popup" role="status" aria-live="polite">
      <div className="client-notification-popup__icon">
        <span className="material-symbols-outlined">notifications</span>
      </div>
      <div className="client-notification-popup__content">
        <span className="client-notification-popup__eyebrow">
          Thông báo mới
        </span>
        <strong>{notification.title || 'Bạn có thông báo mới'}</strong>
        {notification.message && <p>{notification.message}</p>}
      </div>
      <button
        type="button"
        className="client-notification-popup__close"
        aria-label="Đóng thông báo"
        onClick={onClose}
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}
