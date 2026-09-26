# Tài Liệu Kỹ Thuật Dự Án Quiz VNUA

Thư mục này chứa toàn bộ tài liệu đặc tả kiến trúc, công nghệ, API, giao diện và hạ tầng giám sát của dự án **Quiz VNUA**.

---

## Danh Mục Tài Liệu

| Tài liệu | Mô tả chi tiết |
| :--- | :--- |
| **[Kiến Trúc Hệ Thống (Architecture)](./architecture.md)** | Sơ đồ luồng dữ liệu, Reverse Proxy Nginx, hệ thống Domain, cơ chế tải cao RabbitMQ và sơ đồ triển khai UML (Deployment Diagram). |
| **[Sơ Đồ Ca Sử Dụng (Use Case Diagrams)](./diagrams/use-case.md)** | Sơ đồ ca sử dụng tổng thể hệ thống, 6 sơ đồ phân hệ nghiệp vụ chi tiết và 3 bảng đặc tả ca sử dụng (Use Case Specifications) trọng tâm. |
| **[Biểu Đồ Hoạt Động & Trạng Thái (Activity & State Diagrams)](./diagrams/activity-diagrams.md)** | 23 biểu đồ UML gồm 22 Biểu đồ hoạt động (Activity Diagram) cho toàn bộ các phân hệ nghiệp vụ và 1 Biểu đồ máy trạng thái (State Machine Diagram) mô tả toàn bộ vòng đời bài thi UserExam. |
| **[Sơ Đồ Tuần Tự (Sequence Workflows)](./diagrams/workflows.md)** | 10 sơ đồ tuần tự (Sequence Diagram) chi tiết cho: Xác thực/Refresh Token, Làm bài & Nộp bài tải cao RabbitMQ, AI sinh câu hỏi, Giám sát Alertmanager, Quên mật khẩu OTP, Trợ lý AI phân tích kết quả & giải thích, Thông báo realtime WebSocket STOMP, Đăng ký kích hoạt tài khoản, AI sinh lộ trình học tập, và Bảng xếp hạng Redis Caching/Evict. |
| **[Sơ Đồ Quan Hệ Thực Thể (Entity-Relationship Diagram)](./diagrams/entity-relationship.md)** | Sơ đồ quan hệ thực thể (ERD) tổng thể, 4 sơ đồ phân hệ chi tiết và từ điển dữ liệu (Data Dictionary) cho 23 bảng cơ sở dữ liệu quan hệ. |
| **[Backend API & Nghiệp Vụ (Backend)](./backend.md)** | Hướng dẫn phát triển Spring Boot 3.4.0, sơ đồ phân tầng kiến trúc (Layered Architecture), xác thực JWT Cookie, phân quyền, cấu hình RabbitMQ, AI Assistant và danh mục REST API. |
| **[Giao Diện Frontend (Frontend)](./frontend.md)** | Cấu trúc 2 ứng dụng React 18 / Vite 7 (`client` cho người dùng & `admin` cho quản trị viên), thư viện Ant Design và các tính năng. |
| **[Hệ Thống Giám Sát (Monitoring)](./monitoring.md)** | Bộ giải pháp Observability: Prometheus thu thập metrics, Grafana dashboard, Loki gom log tập trung và Alertmanager cảnh báo Telegram. |
| **[Quy Trình CI/CD & Secrets (CI/CD)](./ci-cd.md)** | Đường ống CI/CD tự động, kiểm thử chất lượng, cơ chế nạp biến môi trường tự động qua GitHub Secrets và hướng dẫn triển khai VPS. |
| **[Postman Collection](./postman/Quiz.postman_collection.json)** | File import Postman chứa sẵn toàn bộ mẫu request của các API trong hệ thống. |

---

Để tìm hiểu hướng dẫn cài đặt và chạy ứng dụng nhanh, vui lòng xem file [README.md ngoài thư mục gốc](../README.md).
