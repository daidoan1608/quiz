import { GRAFANA_PUBLIC_URL, PROMETHEUS_PUBLIC_URL } from '../config.js';

/**
 * Hiển thị cảnh báo sự cố từ Prometheus định dạng Block Kit gọn gàng
 */
export function formatAlertsBlockKit(alerts) {
  const nowStr = `${new Date().toLocaleTimeString('vi-VN')} ${new Date().toLocaleDateString('vi-VN')}`;

  if (!alerts || alerts.length === 0) {
    return {
      text: 'Quiz System: Hệ thống hoạt động bình thường, không có cảnh báo.',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Hệ thống ổn định',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Không có cảnh báo nào đang kích hoạt từ Prometheus Alertmanager. Các dịch vụ đang vận hành an toàn.',
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Kiểm tra lúc: \`${nowStr}\``,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Mở Grafana' },
              url: GRAFANA_PUBLIC_URL,
              style: 'primary',
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Kiểm tra lại' },
              action_id: 'action_quick_alerts',
            },
          ],
        },
      ],
    };
  }

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `Cảnh báo hệ thống (${alerts.length})`,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Ghi nhận lúc: \`${nowStr}\` • Nguồn: Prometheus Alertmanager`,
        },
      ],
    },
    { type: 'divider' },
  ];

  for (const a of alerts) {
    const severity = (a.labels?.severity || 'warning').toLowerCase();
    const isCritical = severity === 'critical';
    const statusIcon = isCritical ? '🔴' : '⚠️';
    const summary = a.annotations?.summary || a.labels?.alertname || 'Sự cố không xác định';
    const desc = a.annotations?.description || 'Không có mô tả chi tiết.';
    const job = a.labels?.job || a.labels?.instance || 'N/A';
    const activeSince = a.activeAt ? new Date(a.activeAt).toLocaleTimeString('vi-VN') : 'Mới ghi nhận';

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${statusIcon} *${summary}*\nMức độ: \`${severity.toUpperCase()}\` • Dịch vụ: \`${job}\` • Kích hoạt: \`${activeSince}\``,
      },
    });

    if (desc) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `> ${desc}`,
        },
      });
    }

    blocks.push({ type: 'divider' });
  }

  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: { type: 'plain_text', text: 'Mở Grafana' },
        url: GRAFANA_PUBLIC_URL,
        style: 'primary',
      },
      {
        type: 'button',
        text: { type: 'plain_text', text: 'Mở Prometheus' },
        url: `${PROMETHEUS_PUBLIC_URL}/alerts`,
        style: 'danger',
      },
      {
        type: 'button',
        text: { type: 'plain_text', text: 'Làm mới' },
        action_id: 'action_quick_alerts',
      },
    ],
  });

  return {
    text: `Cảnh báo: Có ${alerts.length} sự cố đang kích hoạt trong hệ thống.`,
    blocks,
  };
}
