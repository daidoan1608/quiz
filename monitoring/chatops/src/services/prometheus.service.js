import { PROMETHEUS_URL } from '../config.js';

/**
 * Lấy danh sách cảnh báo (alerts) từ Prometheus
 */
export async function getPrometheusAlerts() {
  const resp = await fetch(`${PROMETHEUS_URL}/api/v1/alerts`);
  if (!resp.ok) {
    throw new Error(`Prometheus API trả về trạng thái HTTP ${resp.status}`);
  }
  const json = await resp.json();
  return json.data?.alerts || [];
}
