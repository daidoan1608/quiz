# Quiz VNUA

Nền tảng ôn tập và thi trắc nghiệm trực tuyến.  
Kiến trúc: **Spring Boot 3.4.0** + **React 18 (Vite)** + **MySQL 8** + **Redis** + **RabbitMQ** + **Nginx** + **Prometheus/Grafana**.

---

## 1. Hướng Dẫn Chạy Nhanh (Khuyên Dùng)

Hệ thống đã được đóng gói toàn diện bằng Docker Compose và script điều khiển tự động 1 lệnh duy nhất.

### Yêu cầu tiên quyết
- Cài đặt và bật **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Windows / macOS / Linux).

### Khởi động hệ thống
Mở Command Prompt (CMD) hoặc PowerShell tại thư mục dự án và chạy:

```cmd
run.cmd
```
*(Hoặc trên PowerShell: `.\run.ps1`)*

Script sẽ hiển thị bảng điều khiển menu:
```text
==============================================
         QUIZ SYSTEM CONTROLLER              
==============================================
1. Chay App co ban (BE, FE, DB, Redis, RabbitMQ, Nginx)
2. Chay Full App + Monitoring (Prometheus & Grafana)
3. Xem trang thai cac container (Status)
4. Xem Logs he thong
5. Dung he thong (Stop/Down)
6. Kiem tra toan bo dau noi he thong (Doctor Health Check)
0. Thoat
```

---

## 2. Các Lệnh Thao Tác Nhanh

| Lệnh thực thi | Chức năng chi tiết |
| :--- | :--- |
| `.\run.cmd` | Mở bảng điều khiển tương tác (Menu) |
| `.\run.cmd docker-local` | Khởi động stack ứng dụng cơ bản (tiết kiệm RAM máy tính) |
| `.\run.cmd monitor` | Khởi động đầy đủ toàn bộ ứng dụng + bộ giám sát Prometheus/Grafana |
| `.\run.cmd doctor` | Tự động kiểm tra sức khỏe và đấu nối của toàn bộ 13 containers |
| `.\run.cmd status` | Kiểm tra trạng thái hoạt động của các containers |
| `.\run.cmd logs` | Theo dõi nhật ký log hệ thống theo thời gian thực |
| `.\run.cmd stop` | Dừng toàn bộ hệ thống sạch sẽ |

---

## 3. Danh Sách Địa Chỉ Truy Cập (Cổng 80)

Sau khi hệ thống khởi động, toàn bộ dịch vụ được Reverse Proxy qua Nginx cổng **80**:

| Dịch vụ | Địa chỉ truy cập | Thông tin đăng nhập mặc định |
| :--- | :--- | :--- |
| Web Sinh viên (Client) | `http://localhost` | Đăng ký hoặc tài khoản sinh viên |
| Web Quản trị (Admin) | `http://admin.localhost` | `admin` / `change-me` (cấu hình trong `.env`) |
| Backend REST API | `http://api.localhost` | Endpoint API gốc |
| Swagger UI (Tài liệu API) | `http://localhost:8080/swagger-ui` | Xem và thử nghiệm trực tiếp API |
| RabbitMQ Dashboard | `http://rabbitmq.localhost` | `guest` / `guest` |
| Grafana Dashboard | `http://monitor.localhost` | `admin` / `admin` |

---

## 4. Chạy Thủ Công Dành Cho Lập Trình Viên (Dev Mode Không Dùng Docker)

Nếu muốn phát triển và kiểm thử trực tiếp từng thành phần trên máy cá nhân:

### Khởi động Backend
Yêu cầu: JDK 17+, MySQL 8 và Redis đang chạy.
```powershell
cd server
Copy-Item .env.local.example .env.local
.\mvnw.cmd spring-boot:run
```
*(Backend chạy tại `http://localhost:8080`)*

### Khởi động Client (Sinh viên)
```powershell
cd client
npm install
npm run dev
```
*(Client chạy tại `http://localhost:3000`)*

### Khởi động Admin (Quản trị)
```powershell
cd admin
npm install
npm run dev
```
*(Admin chạy tại `http://localhost:3001`)*

---

## 5. Tài Liệu Kỹ Thuật Chi Tiết

Tài liệu chi tiết về kiến trúc, database, nghiệp vụ, API và hạ tầng giám sát được lưu trữ trong thư mục **[`docs/`](docs/README.md)**:

- **[docs/architecture.md](docs/architecture.md)**: Sơ đồ kiến trúc tổng quan, hạ tầng Nginx và cơ chế hàng đợi RabbitMQ.
- **[docs/backend.md](docs/backend.md)**: Chi tiết Spring Boot 3.4.0, bảo mật JWT Cookie, xử lý tải cao, AI sinh câu hỏi từ tài liệu.
- **[docs/frontend.md](docs/frontend.md)**: Chi tiết 2 ứng dụng React Client & Admin, Ant Design, các màn hình chức năng.
- **[docs/monitoring.md](docs/monitoring.md)**: Trọn bộ Observability (Prometheus, Grafana, Loki, Alertmanager gửi cảnh báo Telegram).
- **[docs/postman/](docs/postman/Quiz.postman_collection.json)**: Bộ sưu tập Postman Collection đầy đủ của các API.
