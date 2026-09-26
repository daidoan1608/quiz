# Backend Documentation (Spring Boot 3.4.0)

Thư mục: `server/`

Backend của Quiz VNUA được phát triển trên nền tảng **Java 17** và **Spring Boot 3.4.0**, cung cấp toàn bộ RESTful API, xác thực bảo mật JWT, xử lý nghiệp vụ thi cử, hàng đợi tin nhắn RabbitMQ và các tính năng AI Assistant.

---

## 1. Công Nghệ & Thư Viện Chính

- **Framework:** Spring Boot 3.4.0 (Spring Web, Spring Security, Method Security, WebSocket).
- **ORM & Database:** Spring Data JPA, Hibernate, MySQL Connector/J, Flyway Database Migration.
- **Cache & Session:** Spring Data Redis, GenericJackson2JsonRedisSerializer.
- **Message Broker:** Spring Boot Starter AMQP (RabbitMQ).
- **Tài liệu học thuật & AI:**
  - Apache PDFBox (`pdfbox:3.0.3`): Đọc và trích xuất nội dung file PDF.
  - Apache POI (`poi-ooxml:5.3.0`): Đọc tài liệu Word (DOCX) và bảng biểu Excel.
  - Google Gemini API (`gemini-2.0-flash`) & OpenAI API (`gpt-4o-mini`).
- **Giám sát & Quản trị:** Spring Boot Actuator, Micrometer Prometheus registry.
- **Tài liệu API:** Springdoc OpenAPI 2.7.0 / Swagger UI.

---

## 2. Xác Thực & Phân Quyền (Security)

Hệ thống sử dụng **JWT (JSON Web Token)** lưu trong **HttpOnly Cookie** để ngăn ngừa tấn công XSS.

### Cơ chế Token:
1. Khi đăng nhập thành công (`/api/v1/auth/login` hoặc `/api/v1/auth/google`), server cấp `access_token` và `refresh_token` qua cookie.
2. Frontend gọi API với cấu hình `withCredentials: true`.
3. Khi `access_token` hết hạn, HTTP Interceptor tự động gọi `/api/v1/auth/refresh` để xin cấp token mới mà không bắt người dùng đăng nhập lại.

### Các vai trò (Roles):
- `USER`: Sinh viên / Thí sinh tham gia làm bài ôn tập, thi trắc nghiệm.
- `MOD`: Quản trị viên phụ trách môn học/khoa (quyền hạn theo nhóm cấu hình).
- `ADMIN`: Toàn quyền quản trị hệ thống.

---

## 3. Các Phân Hệ Nghiệp Vụ Chính

### A. Quản Lý Ngân Hàng Câu Hỏi & Đề Thi
- Cấu trúc cây phân cấp: `Category` (Khối ngành) -> `Subject` (Môn học) -> `Chapter` (Chương) -> `Question` (Câu hỏi) -> `Answer` (Đáp án).
- Hỗ trợ câu hỏi nhiều lựa chọn, công thức Toán học LaTeX và đính kèm hình ảnh.
- Hỗ trợ Import câu hỏi hàng loạt từ file Excel.
- Tạo đề thi cố định hoặc đề thi sinh ngẫu nhiên từ ngân hàng câu hỏi theo độ khó.

### B. Làm Bài Thi & Chấm Điểm
- Tự động lưu vết quá trình làm bài (`autosave`), tránh mất đáp án khi mất mạng hoặc reload trang.
- Hỗ trợ nộp bài bất đồng bộ qua RabbitMQ `exam.submission.queue` để chống nghẽn DB khi số lượng sinh viên nộp bài cùng lúc tăng đột biến.

### C. Trợ Lý AI (AI Assistant)
- **Sinh câu hỏi từ tài liệu (`POST /api/v1/ai/generate-questions-from-file`):** Upload file PDF, DOCX hoặc TXT -> Hệ thống trích xuất văn bản và gọi AI tự động sinh câu hỏi trắc nghiệm kèm đáp án và lời giải chi tiết.
- **Giải thích câu hỏi (`POST /api/v1/ai/explain-question`):** Phân tích lý do vì sao đáp án đúng/sai cho từng câu.
- **Gợi ý lộ trình ôn tập (`POST /api/v1/ai/roadmap`):** Phân tích điểm yếu của học viên để đưa ra lộ trình học cá nhân hóa.
- **Phân tích kết quả thi (`POST /api/v1/ai/analyze-exam-result`):** Đánh giá tổng quan năng lực sau bài thi.

---

## 4. Hàng Đợi RabbitMQ (AMQP Integration)

Cấu hình tại: `com.fita.vnua.quiz.config.RabbitMqConfig`

| Tên Hàng Đợi | Routing Key | Worker Xử Lý | Mục Đích |
| :--- | :--- | :--- | :--- |
| `exam.submission.queue` | `exam.submission` | `ExamSubmissionConsumer` | Nhận bài nộp, chấm thi, lưu MySQL |
| `ai.generation.queue` | `ai.generation` | `AiGenerationConsumer` | Chạy ngầm AI sinh câu hỏi từ tài liệu |
| `notification.email.queue` | `notification.email` | `EmailNotificationConsumer` | Gửi email thông báo điểm/kết quả |
| `quiz.dead-letter.queue` | `quiz.dlq.#` | `DeadLetterQueueConsumer` | Hàng đợi lưu các message lỗi để retry/audit |

---

## 5. Danh Sách API Tiêu Biểu & Postman

Base URL: `http://api.localhost/api/v1` (Local) hoặc `https://api.quizvnua.com/api/v1` (Production)

- **Swagger UI:** `http://localhost:8080/swagger-ui` hoặc `http://api.localhost/swagger-ui/index.html`
- **OpenAPI JSON:** `http://api.localhost/v3/api-docs`
- **Postman Collection:** File nằm tại `docs/postman/Quiz.postman_collection.json`
- **Actuator Health:** `http://api.localhost/actuator/health`
- **Prometheus Metrics:** `http://api.localhost/actuator/prometheus`

---

## 6. Sơ Đồ Phân Tầng Kiến Trúc Backend (Layered Architecture Diagram)

Kiến trúc backend được tổ chức theo mô hình phân tầng chặt chẽ (Clean / Layered Architecture) đảm bảo tính mở rộng và dễ bảo trì:

```mermaid
flowchart TD
    subgraph ClientRequests["Yêu cầu từ Client & Web"]
        HTTPReq["HTTP / REST API Request"]
        WSReq["WebSocket STOMP Connection"]
    end

    subgraph SecurityLayer["Tầng Bảo Mật & Lọc Yêu Cầu (Security & Filter)"]
        CorsFilter["CorsFilter & RateLimiter"]
        JwtFilter["JwtAuthenticationFilter\n(Đọc Token từ HttpOnly Cookie)"]
        SecCtx["SecurityContextHolder\n(Thiết lập UserPrincipal & Roles)"]
        CorsFilter --> JwtFilter --> SecCtx
    end

    HTTPReq --> CorsFilter
    WSReq --> SecurityLayer

    subgraph PresentationLayer["Tầng Trình Diễn (Presentation Layer)"]
        AuthController["AuthController\nOtpController"]
        ExamController["ExamAttemptController\nExamController"]
        AIController["AiAssistantController"]
        AdminController["AdminUserController\nAdminQuestionController\nAdminGroupController"]
        NotifyController["NotificationController\nWebSocketChannel"]
        GlobalException["GlobalExceptionHandler\n(@ControllerAdvice)"]
    end

    SecCtx --> AuthController
    SecCtx --> ExamController
    SecCtx --> AIController
    SecCtx --> AdminController
    SecCtx --> NotifyController

    subgraph ServiceLayer["Tầng Xử Lý Nghiệp Vụ (Service Layer)"]
        AuthSvc["AuthService\nOtpService\nUserService"]
        ExamSvc["ExamAttemptService\nExamGradingService"]
        AISvc["AiService\nGeminiClientService"]
        DocSvc["QuestionImportService\nExcelParserService\nPdfExportService"]
        NotifySvc["NotificationService\nEmailService"]
        CacheSvc["RedisCacheService\nLeaderboardService"]
    end

    AuthController --> AuthSvc
    ExamController --> ExamSvc
    AIController --> AISvc
    AdminController --> DocSvc
    AdminController --> AuthSvc
    NotifyController --> NotifySvc

    subgraph AsyncBroker["Tầng Hàng Đợi Bất Đồng Bộ (RabbitMQ Broker)"]
        Producer["RabbitTemplate (Publisher)"]
        ExamConsumer["ExamSubmissionConsumer"]
        AIConsumer["AiGenerationConsumer"]
        MailConsumer["EmailNotificationConsumer"]
        DLQConsumer["DeadLetterQueueConsumer"]

        Producer -->|exam.submission| ExamConsumer
        Producer -->|ai.generation| AIConsumer
        Producer -->|notification.email| MailConsumer
    end

    ExamSvc -->|Nộp bài số lượng lớn| Producer
    AISvc -->|Tác vụ sinh câu hỏi ngầm| Producer
    NotifySvc -->|Gửi mail bất đồng bộ| Producer

    subgraph DataLayer["Tầng Dữ Liệu & Bộ Đệm (Persistence & Storage Layer)"]
        JpaRepo["Spring Data JPA Repositories\n(Hibernate ORM)"]
        RedisRepo["RedisTemplate\n(Session autosave, OTP, Caching)"]
        MySQL[("MySQL 8.0 Database\n(ACID Transactional)")]
        Redis[( "Redis 7 In-Memory\nKey-Value Store" )]

        JpaRepo --> MySQL
        RedisRepo --> Redis
    end

    AuthSvc --> JpaRepo
    AuthSvc --> RedisRepo
    ExamSvc --> JpaRepo
    ExamSvc --> RedisRepo
    ExamConsumer --> JpaRepo
    CacheSvc --> RedisRepo
```

