# Sử dụng node phiên bản alpine để nhẹ và ổn định hơn
FROM node:18-alpine

WORKDIR /app

# Copy package.json và cài đặt trước để tận dụng cache của Docker
COPY package*.json ./
RUN npm install

# Copy toàn bộ code vào
COPY . .

# --- BƯỚC QUAN TRỌNG: Ép React build với biến môi trường Production ---
# Cách này đảm bảo các biến REACT_APP_API_URL từ .env.production được dán vào code
RUN npm run build

# Cài đặt server 'serve' để chạy các file tĩnh sau khi build
RUN npm install -g serve

# Mở cổng 3001 cho admin
EXPOSE 3001

# Chạy thư mục build đã được tối ưu hóa
CMD ["serve", "-s", "build", "-l", "3001"]
