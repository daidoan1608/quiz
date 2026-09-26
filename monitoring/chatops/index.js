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
 * Tạo danh sách trạng thái các container
 */
async function getStatusBlockKit() {
  try {
    const { data: containers } = await callDockerApi('GET', '/containers/json?all=true');
    if (!Array.isArray(containers)) {
      return {
        text: '❌ Không thể kết nối tới Docker Engine socket!',
        blocks: [],
      };
    }

    // Lọc các container thuộc project quiz
    const quizContainers = containers
      .filter((c) => (c.Names || []).some((n) => n.includes('quiz')))
      .sort((a, b) => (a.Names[0] || '').localeCompare(b.Names[0] || ''));

    let summaryText = `*Trạng thái hệ thống Quiz Webapp (${quizContainers.length} containers):*\n\n`;

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 Trạng thái hạ tầng Quiz System',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Cập nhật lúc: \`${new Date().toLocaleTimeString('vi-VN')} ${new Date().toLocaleDateString('vi-VN')}\``,
        },
      },
      { type: 'divider' },
    ];

    let runningCount = 0;
    let stoppedCount = 0;

    for (const c of quizContainers) {
      const name = (c.Names[0] || '').replace('/', '');
      const isUp = c.State === 'running';
      if (isUp) runningCount++;
      else stoppedCount++;

      const statusEmoji = isUp ? '🟢' : '🔴';
      const statusText = `*${statusEmoji} ${name}*\n• Trạng thái: \`${c.Status}\` | Image: \`${c.Image}\``;

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: statusText,
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: isUp ? '🔄 Restart' : '▶️ Start',
            emoji: true,
          },
          value: name,
          action_id: `action_restart_${name}`,
        },
      });
    }

    blocks.push({ type: 'divider' });
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*Tổng kết:* 🟢 ${runningCount} Đang chạy | 🔴 ${stoppedCount} Dừng | Gõ \`/quiz help\` để xem hướng dẫn lệnh.`,
        },
      ],
    });

    return {
      text: summaryText,
      blocks,
    };
  } catch (err) {
    return {
      text: `❌ Lỗi khi đọc trạng thái Docker: ${err.message}`,
      blocks: [],
    };
  }
}

// ==================== LỆNH SLASH COMMAND: /quiz ====================
app.command('/quiz', async ({ command, ack, respond }) => {
  await ack();

  const text = (command.text || '').trim();
  const parts = text.split(/\s+/).filter(Boolean);
  const subCommand = parts[0] ? parts[0].toLowerCase() : 'status';

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

    const container = await findQuizContainer(target);
    if (!container) {
      await respond({
        response_type: 'ephemeral',
        text: `❌ Không tìm thấy container nào khớp với tên: \`${target}\`.`,
      });
      return;
    }

    const containerName = (container.Names[0] || '').replace('/', '');
    await respond({
      response_type: 'in_channel',
      text: `🔄 Đang khởi động lại container \`${containerName}\`... Vui lòng chờ vài giây.`,
    });

    try {
      const res = await callDockerApi('POST', `/containers/${container.Id}/restart?t=10`);
      if (res.status === 204) {
        await respond({
          response_type: 'in_channel',
          text: `✅ Đã khởi động lại thành công container \`${containerName}\`!`,
        });
      } else {
        await respond({
          response_type: 'in_channel',
          text: `⚠️ Khởi động lại container \`${containerName}\` trả về mã: ${res.status}.`,
        });
      }
    } catch (err) {
      await respond({
        response_type: 'in_channel',
        text: `❌ Lỗi khi khởi động lại: ${err.message}`,
      });
    }
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

    const container = await findQuizContainer(target);
    if (!container) {
      await respond({
        response_type: 'ephemeral',
        text: `❌ Không tìm thấy container nào khớp với tên: \`${target}\`.`,
      });
      return;
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

      await respond({
        response_type: 'in_channel',
        text: `📋 *${lines} dòng log gần nhất của \`${containerName}\`:*\n\`\`\`${trimmed || '(Log trống)'}\`\`\``,
      });
    } catch (err) {
      await respond({
        response_type: 'in_channel',
        text: `❌ Lỗi khi đọc logs: ${err.message}`,
      });
    }
    return;
  }

  // 4. /quiz alerts
  if (subCommand === 'alerts' || subCommand === 'alert') {
    try {
      const resp = await fetch(`${PROMETHEUS_URL}/api/v1/alerts`);
      const json = await resp.json();
      const alerts = json.data?.alerts || [];

      if (alerts.length === 0) {
        await respond({
          response_type: 'in_channel',
          text: '✅ *Hệ thống đang hoạt động hoàn hảo!* Không có cảnh báo sự cố nào kích hoạt trên Prometheus.',
        });
        return;
      }

      let alertText = `⚠️ *Phát hiện ${alerts.length} cảnh báo đang kích hoạt:*\n\n`;
      for (const a of alerts) {
        const severity = a.labels?.severity || 'unknown';
        const emoji = severity === 'critical' ? '🔥' : '⚠️';
        alertText += `${emoji} *${a.labels?.alertname}* (\`${severity.toUpperCase()}\`)\n`;
        alertText += `• Tóm tắt: ${a.annotations?.summary || 'N/A'}\n`;
        alertText += `• Chi tiết: ${a.annotations?.description || 'N/A'}\n`;
        alertText += `• Kích hoạt từ: \`${a.activeAt}\`\n\n`;
      }

      await respond({
        response_type: 'in_channel',
        text: alertText,
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
    text: `🛠️ *DANH SÁCH LỆNH QUIZ CHATOPS:*
• \`/quiz status\` - Xem trạng thái chi tiết 13 container Docker (có nút bấm nhanh)
• \`/quiz restart <tên>\` - Khởi động lại service (vd: \`/quiz restart redis\`, \`/quiz restart backend\`)
• \`/quiz logs <tên> [số dòng]\` - Đọc log container (vd: \`/quiz logs backend 30\`)
• \`/quiz alerts\` - Kiểm tra danh sách sự cố đang kích hoạt trên Prometheus
• \`/quiz help\` - Xem menu trợ giúp này`,
  });
});

// ==================== BẮT SỰ KIỆN NÚT BẤM (BUTTON CLICKS) ====================
app.action(/^action_restart_(.+)$/, async ({ action, ack, respond, body }) => {
  await ack();
  const containerName = action.value;
  const user = body.user?.name || body.user?.username || 'User';

  await respond({
    response_type: 'in_channel',
    text: `🔄 *@${user}* vừa bấm khởi động lại container \`${containerName}\`... Vui lòng chờ vài giây.`,
  });

  try {
    const container = await findQuizContainer(containerName);
    if (!container) {
      await respond({
        response_type: 'in_channel',
        text: `❌ Không tìm thấy container \`${containerName}\`!`,
      });
      return;
    }

    const res = await callDockerApi('POST', `/containers/${container.Id}/restart?t=10`);
    if (res.status === 204) {
      await respond({
        response_type: 'in_channel',
        text: `✅ Container \`${containerName}\` đã được khởi động lại thành công!`,
      });
    } else {
      await respond({
        response_type: 'in_channel',
        text: `⚠️ Khởi động lại \`${containerName}\` trả về mã: ${res.status}.`,
      });
    }
  } catch (err) {
    await respond({
      response_type: 'in_channel',
      text: `❌ Lỗi khi khởi động lại \`${containerName}\`: ${err.message}`,
    });
  }
});

// Khởi chạy App
(async () => {
  await app.start();
  console.log('⚡️ Quiz ChatOps Bot is running via Slack Socket Mode!');
})();
