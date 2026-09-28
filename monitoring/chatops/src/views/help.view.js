/**
 * Menu trợ giúp Block Kit
 */
export function getHelpBlockKit() {
  return {
    text: '🤖 QUIZ CHATOPS - HƯỚNG DẪN VẬN HÀNH',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🤖 QUIZ CHATOPS - HƯỚNG DẪN VẬN HÀNH',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Trợ lý điều khiển và giám sát hạ tầng Quiz Webapp trực tiếp qua Slack Socket Mode bảo mật.',
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '• `/quiz status`\n  *Xem bảng điều khiển hạ tầng và trạng thái các container Docker*\n\n• `/quiz restart <tên_service>`\n  *Khởi động lại dịch vụ an toàn (vd: `/quiz restart backend`, `/quiz restart redis`)*\n\n• `/quiz logs <tên_service> [số_dòng]`\n  *Đọc nhật ký hoạt động (vd: `/quiz logs backend 50`)*\n\n• `/quiz alerts`\n  *Kiểm tra danh sách cảnh báo sự cố đang kích hoạt trên Prometheus*',
        },
      },
      { type: 'divider' },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '📊 Xem trạng thái hạ tầng', emoji: true },
            style: 'primary',
            action_id: 'action_refresh_status',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '🚨 Kiểm tra Cảnh báo', emoji: true },
            action_id: 'action_quick_alerts',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '📋 Xem Logs Backend', emoji: true },
            value: 'backend',
            action_id: 'action_logs_backend',
          },
        ],
      },
    ],
  };
}
