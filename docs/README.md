# Tài Liệu Kỹ Thuật Dự Án Quiz VNUA

Thư mục này chứa toàn bộ tài liệu đặc tả kiến trúc, công nghệ, API, giao diện và hạ tầng giám sát của dự án **Quiz VNUA**.

---

## Danh Mục Tài Liệu

| Tài liệu | Mô tả chi tiết |
| :--- | :--- |
| **[Kiến Trúc Hệ Thống (Architecture)](./architecture.md)** | Sơ đồ luồng dữ liệu, Reverse Proxy Nginx, hệ thống Domain và cơ chế xử lý tải cao bất đồng bộ qua RabbitMQ. |
| **[Backend API & Nghiệp Vụ (Backend)](./backend.md)** | Hướng dẫn phát triển Spring Boot 3.4.0, xác thực JWT Cookie, phân quyền, cấu hình RabbitMQ, AI Assistant và danh mục REST API. |
| **[Giao Diện Frontend (Frontend)](./frontend.md)** | Cấu trúc 2 ứng dụng React 18 / Vite 7 (`client` cho người dùng & `admin` cho quản trị viên), thư viện Ant Design và các tính năng. |
| **[Hệ Thống Giám Sát (Monitoring)](./monitoring.md)** | Bộ giải pháp Observability: Prometheus thu thập metrics, Grafana dashboard, Loki gom log tập trung và Alertmanager cảnh báo Telegram. |
| **[Postman Collection](./postman/Quiz.postman_collection.json)** | File import Postman chứa sẵn toàn bộ mẫu request của các API trong hệ thống. |

---

Để tìm hiểu hướng dẫn cài đặt và chạy ứng dụng nhanh, vui lòng xem file [README.md ngoài thư mục gốc](../README.md).
