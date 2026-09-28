import { getStatusBlockKit } from '../views/status.view.js';
import { getLogsBlockKit } from '../views/logs.view.js';
import { formatAlertsBlockKit } from '../views/alerts.view.js';
import { getHelpBlockKit } from '../views/help.view.js';
import { handleRestartContainer } from './restart.handler.js';
import { getPrometheusAlerts } from '../services/prometheus.service.js';

/**
 * Đăng ký slash command /quiz
 */
export function registerCommandHandlers(app) {
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
        const alerts = await getPrometheusAlerts();
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
}
