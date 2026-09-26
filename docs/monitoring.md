# Giám Sát & Cảnh Báo (Observability & Monitoring)

Thư mục cấu hình: `monitoring/`

Hệ thống Quiz VNUA được trang bị bộ giải pháp quan sát toàn diện (Observability Stack) cấp doanh nghiệp, bao gồm việc thu thập số liệu (Metrics), thu thập nhật ký (Logs), trực quan hóa (Dashboard) và phát hiện sự cố tự động (Alerting).

---

## 1. Các Thành Phần Giám Sát

```mermaid
flowchart LR
    subgraph DataSources["Nguồn Thu Thập"]
        BE["Spring Boot Backend\n(:8080/actuator/prometheus)"]
        RE["Redis Exporter\n(:9121)"]
        Logs["Docker Container Logs"]
    end

    subgraph Collection["Thu Thập & Xử Lý"]
        Prom["Prometheus\n(:9090)"]
        PT["Promtail Shipper"]
        Loki["Loki Server\n(:3100)"]
    end

    subgraph Notification["Thông Báo"]
        AM["Alertmanager\n(:9093)"]
        Slack["Slack Channel\n(#quiz-webapp)"]
    end

    subgraph Visualization["Trực Quan Hóa"]
        Graf["Grafana Dashboard\n(http://monitor.localhost)"]
    end

    BE --> Prom
    RE --> Prom
    Logs --> PT --> Loki

    Prom -->|Gửi cảnh báo vi phạm| AM
    AM -->|Bắn webhook sự cố| Slack

    Prom --> Graf
    Loki --> Graf
```

---

## 2. Chi Tiết Từng Công Cụ

### 1. Spring Boot Actuator & Micrometer
- Kích hoạt endpoint `/actuator/prometheus` trên Backend.
- Expose các chỉ số:
  - Tải CPU của hệ thống & tiến trình JVM.
  - Bộ nhớ JVM Heap & Non-Heap.
  - Trạng thái kết nối database pool HikariCP (active connections, idle connections, pending threads).
  - Tần suất và độ trễ các HTTP requests (`http_server_requests_seconds`).

### 2. Prometheus
- Tự động cào dữ liệu metrics mỗi **10 giây** từ `backend:8080` và `redis-exporter:9121`.
- Cấu hình tại: `monitoring/prometheus/prometheus.yml`.
- Quy tắc phát hiện sự cố: `monitoring/prometheus/alert_rules.yml`.

### 3. Alertmanager (Cảnh Báo Tự Động)
- Nhận diện các sự cố nghiêm trọng và tự động gửi thông báo:
  - `BackendDown`: Backend ngừng phản hồi quá 1 phút.
  - `HighCpuUsage`: Tải CPU máy chủ vượt ngưỡng 85% trong 2 phút liên tục.
  - `HighJvmHeapUsage`: Bộ nhớ RAM JVM Heap chạm ngưỡng 90%.
  - `HighHttp5xxRate`: Tỷ lệ lỗi máy chủ (5xx) xuất hiện liên tục.
  - `DatabaseConnectionPoolDepleted`: Cạn kiệt kết nối vào database.
- Cấu hình tại: `monitoring/alertmanager/alertmanager.yml`.
- Mẫu thông báo: Đã định dạng HTML tiếng Việt hiển thị thông tin sự cố đẹp mắt trên Telegram.

### 4. Loki & Promtail (Quản Lý Log Tập Trung)
- **Promtail:** Chạy ngầm và tự động đọc log từ tất cả các Docker containers.
- **Loki:** Lưu trữ và lập chỉ mục log.
- **Lợi ích:** Quản trị viên và Lập trình viên có thể tìm kiếm lỗi, xem Stacktrace Exception của Backend ngay trên giao diện Grafana mà không cần phải SSH vào server hay gõ `docker logs`.

### 5. Grafana Dashboard (Tùy Chỉnh Tiêu Đề)
- Địa chỉ truy cập: **`http://monitor.localhost`** *(Tài khoản mặc định: `admin` / `admin`)*.
- Tiêu đề giao diện (Branding): **Quiz VNUA - Giám Sát Hệ Thống** (Tổ chức: `Quiz VNUA`).
- Tự động nạp sẵn (Provisioning):
  - **Datasource:** Prometheus và Loki.
  - **Dashboard:** `Spring Boot 3 - Application Observability` (giám sát chi tiết JVM, DB, Requests) và `Redis Dashboard`.

### 6. RabbitMQ Management Dashboard (Tùy Chỉnh Tiêu Đề)
- Địa chỉ truy cập: **`http://rabbitmq.localhost`** *(Tài khoản mặc định: `guest` / `guest`)*.
- Tiêu đề thanh tiêu đề (Header): **Quiz VNUA - He Thong Hang Doi**.
- Tên Cluster định danh: **Quiz VNUA Message Broker**.
- Cấu hình tại: `monitoring/rabbitmq/rabbitmq.conf`.

---

## 3. Hướng Dẫn Cấu Hình Bắn Cảnh Báo Về Slack Webhook

Alertmanager đã được cấu hình tích hợp sẵn sàng với kênh Slack:

1. Mở file [monitoring/alertmanager/alertmanager.yml](../monitoring/alertmanager/alertmanager.yml).
2. Đường link Webhook URL được thiết lập trong `slack_api_url` và kênh `#quiz-webapp`:
   ```yaml
   global:
     resolve_timeout: 5m
     slack_api_url: 'YOUR_SLACK_WEBHOOK_URL'

   route:
     group_by: ['alertname', 'job', 'severity']
     group_wait: 10s
     group_interval: 1m
     repeat_interval: 1h
     receiver: 'slack-notifications'

   receivers:
     - name: 'slack-notifications'
       slack_configs:
         - channel: '#quiz-webapp'
           send_resolved: true
           icon_emoji: ':bell:'
           title: '{{ if eq .Status "firing" }}🔥 [CẢNH BÁO SỰ CỐ - {{ .CommonLabels.severity | toUpper }}]{{ else }}✅ [ĐÃ KHẮC PHỤC]{{ end }} {{ .CommonLabels.alertname }}'
           color: '{{ if eq .Status "firing" }}{{ if eq .CommonLabels.severity "critical" }}danger{{ else }}warning{{ end }}{{ else }}good{{ end }}'
   ```
3. Khởi động lại hệ thống bằng lệnh `.\run.cmd monitor`. Khi có sự cố (Backend sập, Redis sập, RabbitMQ sập, CPU quá tải) hoặc khi sự cố được khắc phục xong (`[RESOLVED]`), Alertmanager sẽ tự động gửi tin nhắn kèm thanh màu trực quan (Đỏ / Vàng / Xanh lá) về kênh Slack của bạn.
