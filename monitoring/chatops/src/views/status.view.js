import { getContainers, categorizeContainer } from '../services/docker.service.js';

/**
 * Tạo Dashboard trạng thái hệ thống với Slack Block Kit
 */
export async function getStatusBlockKit() {
  try {
    const { data: containers } = await getContainers(true);
    if (!Array.isArray(containers)) {
      return {
        text: '❌ Không thể kết nối tới Docker Engine socket!',
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: '❌ Lỗi kết nối Docker Engine', emoji: true },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Không thể đọc danh sách container từ `/var/run/docker.sock`. Vui lòng kiểm tra Docker daemon.',
            },
          },
        ],
      };
    }

    // Lọc các container thuộc project quiz
    const quizContainers = containers
      .filter((c) => (c.Names || []).some((n) => n.includes('quiz')))
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

    const nowStr = `${new Date().toLocaleTimeString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}`;
    const healthBadge = stoppedCount === 0 ? '🟢 *Hoạt động ổn định*' : `🔴 *${stoppedCount} container gặp sự cố*`;

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 BẢNG ĐIỀU KHIỂN HẠ TẦNG QUIZ SYSTEM',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*🟢 Đang chạy:* \`${runningCount} / ${quizContainers.length} containers\`` },
          { type: 'mrkdwn', text: `*🔴 Đã dừng:* \`${stoppedCount}\`` },
          { type: 'mrkdwn', text: `*⚡ Trạng thái hạ tầng:* ${healthBadge}` },
          { type: 'mrkdwn', text: `*⏱️ Cập nhật lúc:* \`${nowStr}\`` },
        ],
      },
      { type: 'divider' },
    ];

    const groupMeta = [
      { key: 'apps', title: '🚀 Ứng dụng & Cổng vào (Apps & Gateway)' },
      { key: 'data', title: '💾 Cơ sở dữ liệu & Message Queue' },
      { key: 'observability', title: '🔭 Hạ tầng Giám sát & Logs (Observability)' },
      { key: 'other', title: '📦 Dịch vụ khác' },
    ];

    for (const g of groupMeta) {
      const items = grouped[g.key];
      if (!items || items.length === 0) continue;

      let groupText = `*${g.title}*\n`;
      for (const c of items) {
        const name = (c.Names[0] || '').replace('/', '');
        const isUp = c.State === 'running';
        const emoji = isUp ? '🟢' : '🔴';
        groupText += `${emoji} *${name}* • \`${c.Status}\`\n`;
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

    // Quick Action Bar
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '🔄 Làm mới', emoji: true },
          action_id: 'action_refresh_status',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '🚨 Kiểm tra Cảnh báo', emoji: true },
          action_id: 'action_quick_alerts',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '📋 Logs Backend', emoji: true },
          value: 'backend',
          action_id: 'action_logs_backend',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '🔄 Restart Backend', emoji: true },
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
          text: '💡 Gõ `/quiz restart <service>` để khởi động lại dịch vụ bất kỳ • Gõ `/quiz help` để xem trợ giúp.',
        },
      ],
    });

    return {
      text: `*Trạng thái Quiz System:* 🟢 ${runningCount} Running | 🔴 ${stoppedCount} Stopped`,
      blocks,
    };
  } catch (err) {
    return {
      text: `❌ Lỗi khi đọc trạng thái Docker: ${err.message}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '❌ Lỗi hệ thống', emoji: true },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `Lỗi khi đọc trạng thái Docker Engine: \`${err.message}\`` },
        },
      ],
    };
  }
}
