/**
 * Menu trợ giúp lệnh ChatOps gọn gàng, ít icon
 */
export function getHelpBlockKit() {
  return {
    text: 'Quiz ChatOps - Hướng dẫn sử dụng',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Quiz ChatOps - Hướng dẫn lệnh',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Giám sát và điều khiển hạ tầng qua Slack Socket Mode:',
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '• `/quiz status` - Xem trạng thái các container đang chạy\n• `/quiz restart <service>` - Khởi động lại container (vd: `/quiz restart backend`)\n• `/quiz logs <service> [lines]` - Xem nhật ký log (vd: `/quiz logs backend 50`)\n• `/quiz alerts` - Kiểm tra các cảnh báo sự cố từ Prometheus',
        },
      },
      { type: 'divider' },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Xem trạng thái' },
            style: 'primary',
            action_id: 'action_refresh_status',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Kiểm tra cảnh báo' },
            action_id: 'action_quick_alerts',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Logs Backend' },
            value: 'backend',
            action_id: 'action_logs_backend',
          },
        ],
      },
    ],
  };
}
