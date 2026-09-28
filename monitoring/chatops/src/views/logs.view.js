import { findQuizContainer, getContainerRawLogs, cleanDockerLogs } from '../services/docker.service.js';

/**
 * Hiển thị nhật ký hoạt động (Logs) định dạng Block Kit gọn gàng
 */
export async function getLogsBlockKit(target, lines = 30) {
  const container = await findQuizContainer(target);
  if (!container) {
    return {
      text: `Không tìm thấy container: ${target}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: 'Không tìm thấy Container' },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Không tìm thấy container nào khớp với từ khóa: \`${target}\`.\nKiểm tra danh sách bằng lệnh \`/quiz status\`.`,
          },
        },
      ],
    };
  }

  const containerName = (container.Names[0] || '').replace('/', '');
  try {
    const { buffer } = await getContainerRawLogs(container.Id, lines);
    const cleanLog = cleanDockerLogs(buffer);
    const trimmed = cleanLog.length > 2800 ? cleanLog.slice(-2800) : cleanLog;
    const nowTime = new Date().toLocaleTimeString('vi-VN');

    return {
      text: `Nhật ký ${containerName} (${lines} dòng)`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Nhật ký: ${containerName}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Container:* \`${containerName}\` • *Số dòng:* \`${lines}\` • *Cập nhật:* \`${nowTime}\``,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `\`\`\`${trimmed || '(Log trống)'}\`\`\``,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Làm mới' },
              value: `${target}:${lines}`,
              action_id: `action_logs_${target}`,
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: `Restart ${target}` },
              value: containerName,
              style: 'danger',
              action_id: `action_restart_${containerName}`,
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Trạng thái chung' },
              action_id: 'action_refresh_status',
            },
          ],
        },
      ],
    };
  } catch (err) {
    return {
      text: `Lỗi đọc logs ${containerName}: ${err.message}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: 'Lỗi đọc Logs' },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `Không thể đọc logs của \`${containerName}\`: ${err.message}` },
        },
      ],
    };
  }
}
