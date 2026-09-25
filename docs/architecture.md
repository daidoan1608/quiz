# Kiến Trúc Hệ Thống (System Architecture)

Quiz VNUA là nền tảng ôn tập và thi trắc nghiệm trực tuyến quy mô trường học, được xây dựng theo kiến trúc Micro-services/Monorepo phân tầng rõ ràng, bảo vệ bởi Reverse Proxy Nginx và hỗ trợ xử lý tải cao bất đồng bộ qua RabbitMQ.

---

## 1. Sơ Đồ Kiến Trúc Tổng Thể

```mermaid
flowchart TD
    subgraph Users["Người dùng & Quản trị"]
        U1["Sinh viên / Thí sinh"]
        U2["Giáo viên / ADMIN / MOD"]
    end

    subgraph Proxy["Nginx Reverse Proxy (Cổng 80)"]
        N1["quizvnua.com / localhost"]
        N2["admin.quizvnua.com / admin.localhost"]
        N3["api.quizvnua.com / api.localhost"]
        N4["monitor.quizvnua.com / monitor.localhost"]
        N5["rabbitmq.quizvnua.com / rabbitmq.localhost"]
    end

    U1 --> N1
    U2 --> N2
    Users --> N3
    Users --> N4
    Users --> N5

    subgraph Frontend["Frontend Applications"]
        FE1["client (React 18 + Vite)"]
        FE2["admin (React 18 + Vite)"]
    end

    N1 --> FE1
    N2 --> FE2

    subgraph Backend["Core Backend API"]
        BE["server (Spring Boot 3.4.0 / Java 17)"]
    end

    FE1 -->|REST API & WebSocket| N3
    FE2 -->|REST API| N3
    N3 --> BE

    subgraph DataStorage["Data & In-Memory Layer"]
        DB[("MySQL 8.0\n(RDBMS chính)")]
        Redis[("Redis 7 Alpine\n(Cache & Session)")]
    end

    BE --> DB
    BE --> Redis

    subgraph MessageBroker["Message Broker (Bất Đồng Bộ)"]
        RMQ["RabbitMQ 3.13\n(Topic Exchange + DLQ)"]
        Q1["exam.submission.queue"]
        Q2["ai.generation.queue"]
        Q3["notification.email.queue"]
        RMQ --- Q1
        RMQ --- Q2
        RMQ --- Q3
    end

    BE -->|Publish Tasks| RMQ
    RMQ -->|Consume & Process| BE
    N5 --> RMQ

    subgraph Observability["Giám Sát & Nhật Ký (Monitoring)"]
        Prom["Prometheus\n(Thu thập Metrics)"]
        Loki["Loki & Promtail\n(Thu thập Log)"]
        Alert["Alertmanager\n(Cảnh báo Telegram/Webhook)"]
        Grafana["Grafana 11.2\n(Dashboard trực quan)"]
    end

    BE -->|Actuator Metrics| Prom
    Prom --> Alert
    BE -.->|Container Logs| Loki
    Prom --> Grafana
    Loki --> Grafana
    N4 --> Grafana
```

---

## 2. Hệ Thống Domain & Định Tuyến (Routing)

Tất cả các dịch vụ đều chạy ngầm trong mạng nội bộ Docker và chỉ xuất bản duy nhất qua **Nginx Reverse Proxy** tại cổng **80** (hoặc 443 khi lên production):

| Domain Local | Domain Production | Service Đích | Mục Đích |
| :--- | :--- | :--- | :--- |
| `http://localhost` | `https://quizvnua.com` | `client:3000` | Trang thi và ôn tập cho sinh viên |
| `http://admin.localhost` | `https://admin.quizvnua.com` | `admin:3001` | Trang quản trị hệ thống, nội dung thi |
| `http://api.localhost` | `https://api.quizvnua.com` | `backend:8080` | REST API Spring Boot |
| `http://monitor.localhost` | `https://monitor.quizvnua.com` | `grafana:3000` | Bảng điều khiển giám sát Grafana |
| `http://rabbitmq.localhost` | `https://rabbitmq.quizvnua.com` | `rabbitmq:15672` | Bảng quản lý hàng đợi RabbitMQ |

---

## 3. Cơ Chế Xử Lý Tải Bất Đồng Bộ (RabbitMQ)

Hệ thống sử dụng Topic Exchange `quiz.exchange` kết hợp Dead Letter Exchange `quiz.dlx`:

1. **Nộp bài thi số lượng lớn (`exam.submission.queue`):**
   - API trả về `202 Accepted` cho thí sinh trong 50ms.
   - Workers nhặt bài từ Queue để chấm điểm và lưu kết quả vào MySQL.
   - Bật Manual ACK: Chỉ xóa message khi đã ghi DB thành công; nếu lỗi sẽ chuyển sang Dead Letter Queue, bảo đảm không bao giờ mất bài thi.

2. **Tác vụ AI sinh câu hỏi (`ai.generation.queue`):**
   - Xử lý đọc file PDF/DOCX/TXT và gọi LLM (Gemini / OpenAI) trong background.
   - Giới hạn `prefetch = 1` để kiểm soát tốc độ gọi AI, tránh lỗi 429 Quota Exceeded.

3. **Gửi email thông báo (`notification.email.queue`):**
   - Tách biệt hoàn toàn việc gửi mail SMTP ra khỏi luồng chính, tránh làm chậm các request của người dùng.
