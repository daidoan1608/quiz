import { findQuizContainer, getContainerRawLogs, cleanDockerLogs } from '../services/docker.service.js';

/**
 * Hiển thị nhật ký hoạt động (Logs) định dạng Block Kit
 */
export async function getLogsBlockKit(target, lines = 30) {
  const container = await findQuizContainer(target);
  if (!container) {
    return {
      text: `❌ Không tìm thấy container: ${target}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '❌ Không tìm thấy Container', emoji: true },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Không tìm thấy container nào khớp với từ khóa: \`${target}\`.\nVui lòng kiểm tra lại bằng lệnh \`/quiz status\`.`,
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
      text: `📋 ${lines} dòng log gần nhất của ${containerName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📋 Nhật ký hoạt động: ${containerName}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Container:* \`${containerName}\`` },
            { type: 'mrkdwn', text: `*Số dòng hiển thị:* \`${lines} dòng\`` },
            { type: 'mrkdwn', text: `*Thời điểm:* \`${nowTime}\`` },
            { type: 'mrkdwn', text: `*Nguồn dữ liệu:* \`stdout / stderr\`` },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `\`\`\`${trimmed || '(Log hiện tại đang trống)'}\`\`\``,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: '🔄 Làm mới Logs', emoji: true },
              value: `${target}:${lines}`,
              action_id: `action_logs_${target}`,
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: `🔄 Restart ${target}`, emoji: true },
              value: containerName,
              style: 'danger',
              action_id: `action_restart_${containerName}`,
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: '📊 Xem trạng thái chung', emoji: true },
              action_id: 'action_refresh_status',
            },
          ],
        },
      ],
    };
  } catch (err) {
    return {
      text: `❌ Lỗi khi đọc logs: ${err.message}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '❌ Lỗi đọc Logs', emoji: true },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `Không thể đọc logs của \`${containerName}\`: ${err.message}` },
        },
      ],
    };
  }
}
