import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Tự động nạp biến môi trường từ file .env nếu đang chạy Local (ngoài Docker)
 * Hỗ trợ tìm file .env tại thư mục chatops hoặc file .env gốc của project Quiz
 */
function loadLocalEnv() {
  const candidatePaths = [
    path.resolve(__dirname, '../.env'),             // monitoring/chatops/.env
    path.resolve(__dirname, '../../..', '.env'),    // root .env
  ];

  for (const envPath of candidatePaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const key = trimmed.slice(0, idx).trim();
            let val = trimmed.slice(idx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            // Không ghi đè nếu biến môi trường đã được inject từ bên ngoài
            if (process.env[key] === undefined) {
              process.env[key] = val;
            }
          }
        }
        break; // Đã tìm thấy và nạp thành công 1 file .env phù hợp
      } catch {
        // Bỏ qua nếu có lỗi đọc file
      }
    }
  }
}

// Nạp env file trước khi khởi tạo các hằng số config
loadLocalEnv();

// --- 1. SLACK TOKENS (BẮT BUỘC) ---
export const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
export const SLACK_APP_TOKEN = process.env.SLACK_APP_TOKEN;

// --- 2. PROMETHEUS INTERNAL ENDPOINT (ChatOps gọi nội bộ) ---
// Trong Docker network: http://prometheus:9090, ngoài máy host: http://localhost:9090
export const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://prometheus:9090';

// --- 3. PUBLIC URLS (Dành cho button click trên Slack mở browser người dùng) ---
// Tự động nhận diện port cấu hình từ root .env hoặc dùng URL domain tùy chỉnh
export const GRAFANA_PUBLIC_URL =
  process.env.GRAFANA_PUBLIC_URL ||
  (process.env.GRAFANA_PORT ? `http://localhost:${process.env.GRAFANA_PORT}` : 'http://localhost:3002');

export const PROMETHEUS_PUBLIC_URL =
  process.env.PROMETHEUS_PUBLIC_URL ||
  (process.env.PROMETHEUS_PORT ? `http://localhost:${process.env.PROMETHEUS_PORT}` : 'http://localhost:9090');

// --- 4. DOCKER ENGINE SOCKET ---
// Linux/Docker: /var/run/docker.sock, Windows: //./pipe/docker_engine
export const DOCKER_SOCKET_PATH =
  process.env.DOCKER_SOCKET_PATH ||
  (process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock');

// --- 5. TIỀN TỐ DỰ ÁN (CONTAINER PREFIX) ---
export const CONTAINER_PREFIX = process.env.CONTAINER_PREFIX || 'quiz';

// --- 6. TIMEZONE (Múi giờ hệ thống, mặc định: Asia/Ho_Chi_Minh - UTC+7) ---
export const TIMEZONE = process.env.TZ || process.env.TIMEZONE || 'Asia/Ho_Chi_Minh';

/**
 * Kiểm tra các biến bắt buộc trước khi khởi động
 */
export function validateConfig() {
  if (!SLACK_BOT_TOKEN || !SLACK_APP_TOKEN) {
    console.error('FATAL: SLACK_BOT_TOKEN hoặc SLACK_APP_TOKEN bị thiếu trong biến môi trường!');
    console.error('👉 Vui lòng cấu hình trong file .env ở thư mục gốc hoặc monitoring/chatops/.env');
    process.exit(1);
  }
}
