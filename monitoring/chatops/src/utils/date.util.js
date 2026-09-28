import { TIMEZONE } from '../config.js';

/**
 * Định dạng ngày giờ chuẩn theo timezone hệ thống (mặc định: Asia/Ho_Chi_Minh - UTC+7)
 * Ví dụ: 11:40:15 28/09/2026
 */
export function formatDateTime(date = new Date()) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Không xác định';

  return d.toLocaleString('vi-VN', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false,
  });
}

/**
 * Định dạng giờ phút giây chuẩn theo timezone hệ thống (mặc định: Asia/Ho_Chi_Minh - UTC+7)
 * Ví dụ: 11:40:15
 */
export function formatTime(date = new Date()) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Không xác định';

  return d.toLocaleTimeString('vi-VN', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}
