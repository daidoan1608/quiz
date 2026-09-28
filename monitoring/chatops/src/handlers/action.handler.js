import { getStatusBlockKit } from '../views/status.view.js';
import { getLogsBlockKit } from '../views/logs.view.js';
import { formatAlertsBlockKit } from '../views/alerts.view.js';
import { handleRestartContainer } from './restart.handler.js';
import { getPrometheusAlerts } from '../services/prometheus.service.js';

/**
 * Đăng ký các action handler cho các tương tác button trên Slack
 */
export function registerActionHandlers(app) {
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
      const alerts = await getPrometheusAlerts();
      const content = formatAlertsBlockKit(alerts);
      await respond({
        response_type: 'in_channel',
        ...content,
      });
    } catch (err) {
      await respond({
        response_type: 'in_channel',
        text: `Lỗi khi kiểm tra cảnh báo: ${err.message}`,
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
}
