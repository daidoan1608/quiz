import { findQuizContainer, restartDockerContainer } from '../services/docker.service.js';

/**
 * Xử lý khởi động lại container kèm phản hồi Block Kit
 */
export async function handleRestartContainer(target, user, respond) {
  const container = await findQuizContainer(target);
  if (!container) {
    await respond({
      response_type: 'ephemeral',
      text: `❌ Không tìm thấy container nào khớp với từ khóa: \`${target}\`.`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '❌ Không tìm thấy Container', emoji: true },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Không tìm thấy container nào khớp với từ khóa: \`${target}\`.\nVui lòng gõ \`/quiz status\` để kiểm tra danh sách container.`,
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
    text: `⏳ Đang khởi động lại container \`${containerName}\` theo yêu cầu của ${userMention}...`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `⏳ *Đang tiến hành khởi động lại container:* \`${containerName}\`\n👤 *Yêu cầu bởi:* *${userMention}*\n⏱️ *Đang gửi tín hiệu SIGTERM (grace period 10s)... Vui lòng chờ.*`,
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
        text: `✅ Container \`${containerName}\` đã được khởi động lại thành công!`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '✅ Khởi động lại Container thành công!',
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Container:* \`${containerName}\`` },
              { type: 'mrkdwn', text: `*Trạng thái:* 🟢 \`Running\`` },
              { type: 'mrkdwn', text: `*Thời gian xử lý:* \`${duration} giây\`` },
              { type: 'mrkdwn', text: `*Người kích hoạt:* *${userMention}*` },
            ],
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: { type: 'plain_text', text: `📋 Xem Logs (${containerName})`, emoji: true },
                value: containerName,
                action_id: `action_logs_${containerName}`,
              },
              {
                type: 'button',
                text: { type: 'plain_text', text: '📊 Xem trạng thái toàn hệ thống', emoji: true },
                action_id: 'action_refresh_status',
              },
            ],
          },
        ],
      });
    } else {
      await respond({
        response_type: 'in_channel',
        text: `⚠️ Khởi động lại container \`${containerName}\` trả về mã: ${res.status}.`,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: '⚠️ Phản hồi bất thường khi Restart', emoji: true },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Container \`${containerName}\` phản hồi mã HTTP \`${res.status}\`.\nVui lòng kiểm tra logs hoặc trạng thái container.`,
            },
          },
        ],
      });
    }
  } catch (err) {
    await respond({
      response_type: 'in_channel',
      text: `❌ Lỗi khi khởi động lại: ${err.message}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '❌ Lỗi khi khởi động lại Container', emoji: true },
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
