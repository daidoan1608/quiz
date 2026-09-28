/**
 * Hiển thị cảnh báo sự cố từ Prometheus định dạng Block Kit
 */
export function formatAlertsBlockKit(alerts) {
  const nowStr = `${new Date().toLocaleTimeString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}`;

  if (!alerts || alerts.length === 0) {
    return {
      text: '✅ Quiz System: Tất cả hệ thống đang hoạt động ổn định, không có cảnh báo!',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '✨ HỆ THỐNG HOẠT ĐỘNG HOÀN HẢO',
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🟢 *Không có cảnh báo sự cố nào đang kích hoạt!*\nToàn bộ các dịch vụ Core Backend, Database, Redis, RabbitMQ, CPU và Memory đều đang nằm trong ngưỡng vận hành an toàn.',
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `⏱️ Kiểm tra lúc: \`${nowStr}\` • Nguồn: Prometheus Alert Engine`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: '📊 Mở Grafana Dashboard', emoji: true },
              url: 'http://localhost:3000',
              style: 'primary',
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: '🔄 Kiểm tra lại', emoji: true },
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
        text: `🚨 CẢNH BÁO SỰ CỐ (${alerts.length} sự cố đang kích hoạt)`,
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Thời điểm ghi nhận:* \`${nowStr}\`\n*Hạ tầng giám sát:* ` + '`Prometheus Alertmanager`',
      },
    },
    { type: 'divider' },
  ];

  for (const a of alerts) {
    const severity = (a.labels?.severity || 'warning').toLowerCase();
    const isCritical = severity === 'critical';
    const badgeEmoji = isCritical ? '🔥' : '⚠️';
    const summary = a.annotations?.summary || a.labels?.alertname || 'Sự cố không xác định';
    const desc = a.annotations?.description || 'Không có mô tả chi tiết.';
    const job = a.labels?.job || a.labels?.instance || 'N/A';
    const activeSince = a.activeAt ? new Date(a.activeAt).toLocaleTimeString('vi-VN') : 'Mới ghi nhận';

    blocks.push({
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Sự cố:* ${badgeEmoji} *${summary}*` },
        { type: 'mrkdwn', text: `*Mức độ:* \`${severity.toUpperCase()}\`` },
        { type: 'mrkdwn', text: `*Dịch vụ:* \`${job}\`` },
        { type: 'mrkdwn', text: `*Kích hoạt từ:* \`${activeSince}\`` },
      ],
    });

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `> *Chi tiết:* ${desc}`,
      },
    });

    blocks.push({ type: 'divider' });
  }

  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: { type: 'plain_text', text: '📊 Mở Grafana', emoji: true },
        url: 'http://localhost:3000',
        style: 'primary',
      },
      {
        type: 'button',
        text: { type: 'plain_text', text: '🚨 Mở Prometheus Alerts', emoji: true },
        url: 'http://localhost:9090/alerts',
        style: 'danger',
      },
      {
        type: 'button',
        text: { type: 'plain_text', text: '🔄 Làm mới cảnh báo', emoji: true },
        action_id: 'action_quick_alerts',
      },
    ],
  });

  return {
    text: `⚠️ Phát hiện ${alerts.length} cảnh báo sự cố đang kích hoạt!`,
    blocks,
  };
}
