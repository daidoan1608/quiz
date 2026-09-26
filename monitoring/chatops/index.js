import pkg from '@slack/bolt';
const { App } = pkg;
import http from 'http';

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_APP_TOKEN = process.env.SLACK_APP_TOKEN;
const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://prometheus:9090';

if (!SLACK_BOT_TOKEN || !SLACK_APP_TOKEN) {
  console.error('FATAL: SLACK_BOT_TOKEN or SLACK_APP_TOKEN is missing in environment!');
  process.exit(1);
}

const app = new App({
  token: SLACK_BOT_TOKEN,
  appToken: SLACK_APP_TOKEN,
  socketMode: true,
});

/**
 * Gọi Docker Engine API qua UNIX Socket /var/run/docker.sock
 */
function callDockerApi(method, path, body = null, returnBuffer = false) {
  return new Promise((resolve, reject) => {
    const options = {
      socketPath: '/var/run/docker.sock',
      path,
      method,
      headers: body
        ? {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          }
        : {},
    };

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const fullBuffer = Buffer.concat(chunks);
        if (returnBuffer) {
          return resolve({ status: res.statusCode, buffer: fullBuffer });
        }
        const text = fullBuffer.toString('utf8');
        try {
          resolve({ status: res.statusCode, data: text ? JSON.parse(text) : null, raw: text });
        } catch {
          resolve({ status: res.statusCode, data: text, raw: text });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(body);
    req.end();
  });
}

/**
 * Xử lý header multiplex 8-byte từ Docker logs
 */
function cleanDockerLogs(buffer) {
  let offset = 0;
  let output = '';
  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) {
      output += buffer.subarray(offset).toString('utf8');
      break;
    }
    const size = buffer.readUInt32BE(offset + 4);
    if (size > 0 && offset + 8 + size <= buffer.length) {
      output += buffer.subarray(offset + 8, offset + 8 + size).toString('utf8');
      offset += 8 + size;
    } else {
      output += buffer.subarray(offset).toString('utf8');
      break;
    }
  }
  return output.trim() || buffer.toString('utf8').replace(/[\x00-\x08]/g, '');
}

/**
 * Phân loại container theo cụm chức năng
 */
function categorizeContainer(name) {
  const lower = name.toLowerCase();
  if (lower.includes('backend') || lower.includes('user') || lower.includes('admin') || lower.includes('client') || lower.includes('nginx')) {
    return 'apps';
  }
  if (lower.includes('db') || lower.includes('mysql') || lower.includes('postgres') || lower.includes('redis') || lower.includes('rabbitmq')) {
    return 'data';
  }
  if (lower.includes('prometheus') || lower.includes('grafana') || lower.includes('loki') || lower.includes('promtail') || lower.includes('alertmanager') || lower.includes('chatops')) {
    return 'observability';
  }
  return 'other';
}

/**
 * Tìm container dựa trên tên ngắn gọn (vd: redis, backend, db...)
 */
async function findQuizContainer(shortName) {
  const { data: containers } = await callDockerApi('GET', '/containers/json?all=true');
  if (!Array.isArray(containers)) return null;

  const cleanQuery = shortName.toLowerCase().trim();
  return containers.find((c) => {
    const names = c.Names || [];
    return names.some((n) => {
      const lower = n.toLowerCase();
      return (
        lower === `/${cleanQuery}` ||
        lower === `/quiz-${cleanQuery}-1` ||
        lower.includes(cleanQuery)
      );
    });
  });
}

/**
 * Tạo Dashboard trạng thái hệ thống với Slack Block Kit
 */
async function getStatusBlockKit() {
  try {
    const { data: containers } = await callDockerApi('GET', '/containers/json?all=true');
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

/**
 * Hiển thị nhật ký hoạt động (Logs) định dạng Block Kit
 */
async function getLogsBlockKit(target, lines = 30) {
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
    const { buffer } = await callDockerApi(
      'GET',
      `/containers/${container.Id}/logs?stdout=1&stderr=1&tail=${lines}`,
      null,
      true
    );
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

/**
 * Hiển thị cảnh báo sự cố từ Prometheus định dạng Block Kit
 */
function formatAlertsBlockKit(alerts) {
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

/**
 * Xử lý khởi động lại container kèm phản hồi Block Kit
 */
async function handleRestartContainer(target, user, respond) {
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
    const res = await callDockerApi('POST', `/containers/${container.Id}/restart?t=10`);
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

/**
 * Menu trợ giúp Block Kit
 */
function getHelpBlockKit() {
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

// ==================== LỆNH SLASH COMMAND: /quiz ====================
app.command('/quiz', async ({ command, ack, respond }) => {
  await ack();

  const text = (command.text || '').trim();
  const parts = text.split(/\s+/).filter(Boolean);
  const subCommand = parts[0] ? parts[0].toLowerCase() : 'status';
  const userName = command.user_name || command.user_id || 'User';

  // 1. /quiz status
  if (subCommand === 'status') {
    const content = await getStatusBlockKit();
    await respond({
      response_type: 'in_channel',
      ...content,
    });
    return;
  }

  // 2. /quiz restart <service>
  if (subCommand === 'restart') {
    const target = parts[1];
    if (!target) {
      await respond({
        response_type: 'ephemeral',
        text: '⚠️ Vui lòng chỉ định service cần khởi động lại. Ví dụ: `/quiz restart redis` hoặc `/quiz restart backend`.',
      });
      return;
    }
    await handleRestartContainer(target, userName, respond);
    return;
  }

  // 3. /quiz logs <service> [lines]
  if (subCommand === 'logs' || subCommand === 'log') {
    const target = parts[1];
    const lines = parseInt(parts[2], 10) || 30;

    if (!target) {
      await respond({
        response_type: 'ephemeral',
        text: '⚠️ Vui lòng chỉ định service cần xem log. Ví dụ: `/quiz logs backend 30` hoặc `/quiz logs redis`.',
      });
      return;
    }

    const content = await getLogsBlockKit(target, lines);
    await respond({
      response_type: 'in_channel',
      ...content,
    });
    return;
  }

  // 4. /quiz alerts
  if (subCommand === 'alerts' || subCommand === 'alert') {
    try {
      const resp = await fetch(`${PROMETHEUS_URL}/api/v1/alerts`);
      const json = await resp.json();
      const alerts = json.data?.alerts || [];
      const content = formatAlertsBlockKit(alerts);
      await respond({
        response_type: 'in_channel',
        ...content,
      });
    } catch (err) {
      await respond({
        response_type: 'in_channel',
        text: `❌ Lỗi khi truy vấn Prometheus alerts: ${err.message}`,
      });
    }
    return;
  }

  // 5. /quiz help hoặc lệnh không xác định
  await respond({
    response_type: 'ephemeral',
    ...getHelpBlockKit(),
  });
});

// ==================== BẮT SỰ KIỆN NÚT BẤM (BUTTON CLICKS) ====================
// Làm mới trạng thái
app.action('action_refresh_status', async ({ ack, respond }) => {
  await ack();
  const content = await getStatusBlockKit();
  await respond({
    response_type: 'in_channel',
    replace_original: false,
    ...content,
  });
});

// Kiểm tra cảnh báo nhanh
app.action('action_quick_alerts', async ({ ack, respond }) => {
  await ack();
  try {
    const resp = await fetch(`${PROMETHEUS_URL}/api/v1/alerts`);
    const json = await resp.json();
    const alerts = json.data?.alerts || [];
    const content = formatAlertsBlockKit(alerts);
    await respond({
      response_type: 'in_channel',
      ...content,
    });
  } catch (err) {
    await respond({
      response_type: 'in_channel',
      text: `❌ Lỗi khi kiểm tra cảnh báo: ${err.message}`,
    });
  }
});

// Xem logs
app.action(/^action_logs_(.+)$/, async ({ action, ack, respond }) => {
  await ack();
  let target = action.value || action.action_id.replace('action_logs_', '');
  let lines = 30;
  if (target.includes(':')) {
    const parts = target.split(':');
    target = parts[0];
    lines = parseInt(parts[1], 10) || 30;
  }
  const content = await getLogsBlockKit(target, lines);
  await respond({
    response_type: 'in_channel',
    ...content,
  });
});

// Khởi động lại container
app.action(/^action_restart_(.+)$/, async ({ action, ack, respond, body }) => {
  await ack();
  const containerName = action.value || action.action_id.replace('action_restart_', '');
  const user = body.user?.name || body.user?.username || 'User';
  await handleRestartContainer(containerName, user, respond);
});

// Khởi chạy App
(async () => {
  await app.start();
  console.log('⚡️ Quiz ChatOps Bot is running via Slack Socket Mode!');
})();
