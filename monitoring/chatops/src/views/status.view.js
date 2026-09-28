import { getContainers, categorizeContainer } from '../services/docker.service.js';
import { CONTAINER_PREFIX } from '../config.js';

/**
 * Dashboard trạng thái hệ thống định dạng Block Kit (gọn gàng, ít icon)
 */
export async function getStatusBlockKit() {
  try {
    const { data: containers } = await getContainers(true);
    if (!Array.isArray(containers)) {
      return {
        text: 'Lỗi: Không thể kết nối tới Docker Engine socket.',
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: 'Lỗi kết nối Docker Engine' },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Không thể đọc danh sách container từ Docker socket. Vui lòng kiểm tra Docker daemon.',
            },
          },
        ],
      };
    }

    const prefix = CONTAINER_PREFIX.toLowerCase();
    const quizContainers = containers
      .filter((c) => (c.Names || []).some((n) => n.toLowerCase().includes(prefix)))
      .sort((a, b) => (a.Names[0] || '').localeCompare(b.Names[0] || ''));

    let runningCount = 0;
    let stoppedCount = 0;
    const grouped = {
      apps: [],
      data: [],
      observability: [],
      other: [],
    };

    for (const c of quizContainers) {
      const isUp = c.State === 'running';
      if (isUp) runningCount++;
      else stoppedCount++;

      const groupKey = categorizeContainer(c.Names[0] || '');
      grouped[groupKey].push(c);
    }

    const nowStr = `${new Date().toLocaleTimeString('vi-VN')} ${new Date().toLocaleDateString('vi-VN')}`;
    const healthBadge = stoppedCount === 0 ? '🟢 Ổn định' : `🔴 ${stoppedCount} đã dừng`;

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Trạng thái hệ thống (Quiz)',
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Đang chạy:* \`${runningCount}/${quizContainers.length}\`` },
          { type: 'mrkdwn', text: `*Đã dừng:* \`${stoppedCount}\`` },
          { type: 'mrkdwn', text: `*Tình trạng:* ${healthBadge}` },
          { type: 'mrkdwn', text: `*Cập nhật:* \`${nowStr}\`` },
        ],
      },
      { type: 'divider' },
    ];

    const groupMeta = [
      { key: 'apps', title: 'Ứng dụng & Gateway' },
      { key: 'data', title: 'Cơ sở dữ liệu & Message Queue' },
      { key: 'observability', title: 'Giám sát & Logs' },
      { key: 'other', title: 'Dịch vụ khác' },
    ];

    for (const g of groupMeta) {
      const items = grouped[g.key];
      if (!items || items.length === 0) continue;

      let groupText = `*${g.title}*\n`;
      for (const c of items) {
        const name = (c.Names[0] || '').replace('/', '');
        const isUp = c.State === 'running';
        const statusDot = isUp ? '🟢' : '🔴';
        groupText += `${statusDot} \`${name}\` - ${c.Status}\n`;
      }

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: groupText.trim(),
        },
      });
    }

    blocks.push({ type: 'divider' });

    // Action buttons gọn gàng
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Làm mới' },
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
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Restart Backend' },
          value: 'backend',
          style: 'danger',
          action_id: 'action_restart_backend',
        },
      ],
    });

    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: 'Gõ `/quiz restart <service>` để khởi động lại • `/quiz help` để xem trợ giúp.',
        },
      ],
    });

    return {
      text: `Trạng thái Quiz: ${runningCount} đang chạy, ${stoppedCount} đã dừng`,
      blocks,
    };
  } catch (err) {
    return {
      text: `Lỗi đọc trạng thái Docker: ${err.message}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: 'Lỗi hệ thống' },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `Không thể đọc trạng thái Docker Engine: \`${err.message}\`` },
        },
      ],
    };
  }
}
