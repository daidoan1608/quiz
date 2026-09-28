import pkg from '@slack/bolt';
const { App } = pkg;
import { SLACK_BOT_TOKEN, SLACK_APP_TOKEN, validateConfig } from './src/config.js';
import { registerCommandHandlers } from './src/handlers/command.handler.js';
import { registerActionHandlers } from './src/handlers/action.handler.js';

// Kiểm tra biến môi trường bắt buộc
validateConfig();

// Khởi tạo Slack Bolt App
const app = new App({
  token: SLACK_BOT_TOKEN,
  appToken: SLACK_APP_TOKEN,
  socketMode: true,
});

// Đăng ký các Slash Commands và Action Handlers
registerCommandHandlers(app);
registerActionHandlers(app);

// Khởi chạy App
(async () => {
  await app.start();
  console.log('⚡️ Quiz ChatOps Bot is running via Slack Socket Mode!');
})();
