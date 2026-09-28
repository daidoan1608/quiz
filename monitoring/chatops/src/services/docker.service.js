import http from 'http';
import { DOCKER_SOCKET_PATH, CONTAINER_PREFIX } from '../config.js';

/**
 * Gọi Docker Engine API qua UNIX Socket
 */
export function callDockerApi(method, path, body = null, returnBuffer = false) {
  return new Promise((resolve, reject) => {
    const options = {
      socketPath: DOCKER_SOCKET_PATH,
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
export function cleanDockerLogs(buffer) {
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
export function categorizeContainer(name) {
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
export async function findQuizContainer(shortName) {
  const { data: containers } = await callDockerApi('GET', '/containers/json?all=true');
  if (!Array.isArray(containers)) return null;

  const cleanQuery = shortName.toLowerCase().trim();
  const prefix = CONTAINER_PREFIX.toLowerCase();
  return containers.find((c) => {
    const names = c.Names || [];
    return names.some((n) => {
      const lower = n.toLowerCase();
      return (
        lower === `/${cleanQuery}` ||
        lower === `/${prefix}-${cleanQuery}-1` ||
        lower.includes(cleanQuery)
      );
    });
  });
}

/**
 * Lấy danh sách toàn bộ container
 */
export async function getContainers(all = true) {
  return callDockerApi('GET', `/containers/json?all=${all}`);
}

/**
 * Lấy logs dạng raw buffer của một container
 */
export async function getContainerRawLogs(containerId, lines = 30) {
  return callDockerApi(
    'GET',
    `/containers/${containerId}/logs?stdout=1&stderr=1&tail=${lines}`,
    null,
    true
  );
}

/**
 * Khởi động lại container theo ID với timeout grace period
 */
export async function restartDockerContainer(containerId, timeout = 10) {
  return callDockerApi('POST', `/containers/${containerId}/restart?t=${timeout}`);
}
