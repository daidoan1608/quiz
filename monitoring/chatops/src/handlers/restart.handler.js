import { findQuizContainer, restartDockerContainer } from '../services/docker.service.js';

/**
 * Xử lý khởi động lại container với phản hồi gọn gàng, ít icon
 */
export async function handleRestartContainer(target, user, respond) {
  const container = await findQuizContainer(target);
  if (!container) {
    await respond({
      response_type: 'ephemeral',
      text: `Không tìm thấy container nào khớp với từ khóa: \`${target}\`.`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: 'Không tìm thấy Container' },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Không tìm thấy container: \`${target}\`.\nDùng lệnh \`/quiz status\` để kiểm tra danh sách container hiện có.`,
          },
        },
      ],
    });
    return;
  }

  const containerName = (container.Names[0] || '').replace('/', '');
  const userMention = user ? (user.startsWith('@') ? user : `@${user}`) : 'Admin';

  await respond({
    response_type: 'in_channel',
    text: `Đang khởi động lại container \`${containerName}\` theo yêu cầu của ${userMention}...`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Đang gửi tín hiệu khởi động lại \`${containerName}\` (Yêu cầu bởi: ${userMention}, grace period 10s)...`,
        },
      },
    ],
  });

  try {
    const startTime = Date.now();
    const res = await restartDockerContainer(container.Id, 10);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (res.status === 204) {
      await respond({
        response_type: 'in_channel',
        text: `Container \`${containerName}\` đã được khởi động lại thành công!`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'Khởi động lại thành công',
            },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Container:* \`${containerName}\`` },
              { type: 'mrkdwn', text: `*Trạng thái:* 🟢 \`Running\`` },
              { type: 'mrkdwn', text: `*Thời gian xử lý:* \`${duration}s\`` },
              { type: 'mrkdwn', text: `*Người thực hiện:* ${userMention}` },
            ],
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: { type: 'plain_text', text: `Logs (${containerName})` },
                value: containerName,
                action_id: `action_logs_${containerName}`,
              },
              {
                type: 'button',
                text: { type: 'plain_text', text: 'Trạng thái hệ thống' },
                action_id: 'action_refresh_status',
              },
            ],
          },
        ],
      });
    } else {
      await respond({
        response_type: 'in_channel',
        text: `Phản hồi bất thường khi khởi động lại \`${containerName}\` (Mã HTTP: ${res.status}).`,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: 'Phản hồi bất thường khi Restart' },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Container \`${containerName}\` phản hồi mã HTTP \`${res.status}\`. Vui lòng kiểm tra lại trạng thái.`,
            },
          },
        ],
      });
    }
  } catch (err) {
    await respond({
      response_type: 'in_channel',
      text: `Lỗi khi khởi động lại \`${containerName}\`: ${err.message}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: 'Lỗi khi khởi động lại' },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Không thể khởi động lại \`${containerName}\`: ${err.message}`,
          },
        },
      ],
    });
  }
}
