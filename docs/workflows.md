# Sơ Đồ Luồng Hoạt Động Các Chức Năng Chính (Workflows)

Tài liệu này mô tả chi tiết bằng sơ đồ tuần tự (Sequence Diagram) cho các nghiệp vụ trọng tâm trong hệ thống Quiz VNUA.

---

## 1. Luồng Xác Thực & Tự Động Làm Mới Token (Authentication & Auto Refresh)

Hệ thống sử dụng cơ chế bảo mật kép: Access Token có thời hạn ngắn (15 phút) và Refresh Token có thời hạn dài (7 ngày) lưu an toàn trong `HttpOnly Cookie`.

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant React as React Client (Frontend)
    participant Nginx as Nginx Proxy
    participant AuthAPI as Spring Boot (Auth Controller)
    participant DB as MySQL Database

    User->>React: Nhập tài khoản & mật khẩu
    React->>Nginx: POST /api/v1/auth/login
    Nginx->>AuthAPI: Chuyển tiếp request
    AuthAPI->>DB: Truy vấn thông tin tài khoản & verify mật khẩu BCrypt
    DB-->>AuthAPI: Thông tin người dùng hợp lệ
    AuthAPI->>DB: Lưu RefreshToken entity
    AuthAPI-->>Nginx: Trả về HTTP 200 kèm Set-Cookie (accessToken, refreshToken)
    Nginx-->>React: Set-Cookie HttpOnly vào trình duyệt
    React-->>User: Đăng nhập thành công, chuyển hướng vào Dashboard

    Note over User, React: Trong quá trình sử dụng (sau 15 phút Access Token hết hạn)
    User->>React: Thực hiện thao tác cần quyền hạn
    React->>Nginx: Gửi API kèm cookie (accessToken hết hạn)
    Nginx->>AuthAPI: Chuyển tiếp request
    AuthAPI-->>Nginx: Trả về HTTP 401 Unauthorized
    Nginx-->>React: HTTP 401
    
    Note over React, AuthAPI: Axios Interceptor tự động xử lý ngầm (Silent Refresh)
    React->>Nginx: POST /api/v1/auth/refresh (kèm refreshToken cookie)
    Nginx->>AuthAPI: Chuyển tiếp request refresh
    AuthAPI->>DB: Kiểm tra refreshToken còn hạn & hợp lệ
    DB-->>AuthAPI: Token hợp lệ
    AuthAPI-->>Nginx: Cấp mới accessToken (Set-Cookie)
    Nginx-->>React: Cập nhật cookie mới
    React->>Nginx: Gửi lại request ban đầu của người dùng
    Nginx->>AuthAPI: Thực hiện request thành công
    AuthAPI-->>React: Trả về kết quả bình thường
    React-->>User: Hiển thị dữ liệu mượt mà, không bị gián đoạn
```

---

## 2. Luồng Làm Bài Thi & Nộp Bài Tải Cao Bất Đồng Bộ (Exam Taking & Async Submission)

Để giải quyết bài toán hàng trăm/hàng nghìn thí sinh nộp bài cùng lúc vào phút cuối của ca thi, hệ thống sử dụng hàng đợi RabbitMQ để phân tách việc tiếp nhận bài thi và tiến trình chấm điểm.

```mermaid
sequenceDiagram
    autonumber
    actor Student as Sinh viên (Thí sinh)
    participant Client as React Client (Web)
    participant ExamAPI as Backend API
    participant Cache as Redis Cache
    participant Queue as RabbitMQ (exam.submission.queue)
    participant Worker as Background Consumer
    participant DB as MySQL Database

    Student->>Client: Bấm "Bắt đầu làm bài thi"
    Client->>ExamAPI: POST /api/v1/exam-attempts/start {examId}
    ExamAPI->>DB: Tạo bản ghi UserExam (Status: IN_PROGRESS)
    ExamAPI->>Cache: Lưu phiên làm bài vào Redis (Cache TTL)
    ExamAPI-->>Client: Trả về thông tin đề thi & danh sách câu hỏi
    Client-->>Student: Bắt đầu đếm ngược thời gian làm bài

    Note over Student, ExamAPI: Quá trình làm bài (Autosave liên tục)
    loop Mỗi khi chọn đáp án
        Student->>Client: Chọn đáp án cho câu hỏi
        Client->>ExamAPI: POST /api/v1/exam-attempts/{userExamId}/answers
        ExamAPI->>Cache: Lưu tạm đáp án vào Redis (giảm tải MySQL)
        ExamAPI-->>Client: HTTP 200 (Đã ghi nhận câu trả lời)
    end

    Note over Student, DB: Nộp bài thi khi hết giờ hoặc bấm hoàn thành
    Student->>Client: Bấm "Nộp bài thi" (hoặc đồng hồ về 0)
    Client->>ExamAPI: POST /api/v1/exam-attempts/{userExamId}/submit
    ExamAPI->>ExamAPI: Validate trạng thái bài thi cơ bản
    ExamAPI->>Queue: Đẩy message ExamSubmissionMessage vào RabbitMQ
    ExamAPI-->>Client: HTTP 202 Accepted ("Đã nhận bài, đang xử lý chấm điểm")
    Client-->>Student: Hiển thị thông báo "Bài thi đã nộp thành công, hệ thống đang chấm..."

    Note over Queue, DB: Xử lý chấm thi ngầm (Asynchronous Worker)
    Queue->>Worker: Dispatch bài thi tới ExamSubmissionConsumer
    Worker->>Cache: Đọc toàn bộ đáp án thí sinh đã chọn
    Worker->>DB: Đọc barem đáp án đúng của đề thi
    Worker->>Worker: So khớp đáp án, tính tổng điểm, số câu đúng/sai
    Worker->>DB: Lưu kết quả chi tiết UserExam (Status: SUBMITTED, Score, EndTime)
    Worker->>Worker: Manual ACK xác nhận xử lý thành công với RabbitMQ
    Worker->>Queue: Bắn tiếp task vào notification.email.queue (Gửi mail bảng điểm)
    
    Student->>Client: Xem chi tiết kết quả bài thi
    Client->>ExamAPI: GET /api/v1/user-exams/{userExamId}
    ExamAPI->>DB: Truy vấn kết quả bài thi đã chấm
    DB-->>ExamAPI: Trả về UserExamDto
    ExamAPI-->>Client: Trả về kết quả
    Client-->>Student: Hiển thị bảng điểm, đáp án đúng và lời giải chi tiết
```

---

## 3. Luồng AI Sinh Câu Hỏi Trắc Nghiệm Từ Tài Liệu (Background AI Generation)

Tác vụ phân tích tài liệu và gọi mô hình ngôn ngữ lớn (Gemini / OpenAI) thường mất từ 10 - 30 giây. Do đó luồng được xử lý bất đồng bộ để tránh nghẽn thread pool của server.

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Giáo viên / Quản trị viên
    participant AdminUI as Admin Frontend
    participant AiAPI as Backend API
    participant Parser as File Document Parser
    participant Queue as RabbitMQ (ai.generation.queue)
    participant Worker as AI Worker Consumer
    participant LLM as Google Gemini / OpenAI API
    participant DB as MySQL Database

    Teacher->>AdminUI: Tải file lên (PDF, DOCX hoặc TXT) & chọn số lượng câu hỏi
    AdminUI->>AiAPI: POST /api/v1/ai/generate-questions-from-file (MultipartFile)
    AiAPI->>Parser: Trích xuất nội dung văn bản (PDFBox / Apache POI)
    Parser-->>AiAPI: Trả về chuỗi văn bản sạch (Cleaned text)
    AiAPI->>AiAPI: Khởi tạo jobId và đóng gói AiGenerationMessage
    AiAPI->>Queue: Đẩy task vào RabbitMQ (Prefetch = 1)
    AiAPI-->>AdminUI: HTTP 202 Accepted { jobId: "ai-job-xxx", status: "PROCESSING" }
    AdminUI-->>Teacher: Hiển thị thanh tiến trình xử lý tài liệu

    Note over Queue, LLM: Xử lý sinh câu hỏi ở Background
    Queue->>Worker: AI Consumer nhặt job xử lý tuần tự (tránh vượt quota API)
    Worker->>Worker: Xây dựng System Prompt sư phạm & User Prompt
    Worker->>LLM: Gọi API sinh câu hỏi (Structured JSON Schema)
    LLM-->>Worker: Trả về mảng JSON danh sách câu hỏi, đáp án, giải thích
    Worker->>Worker: Parse JSON thành danh sách GeneratedQuestionDto
    Worker->>DB: Lưu các câu hỏi và đáp án vào Ngân hàng câu hỏi (theo Chapter chỉ định)
    Worker->>Worker: Cập nhật trạng thái jobId = COMPLETED
    Worker->>Worker: Bắn sự kiện realtime qua WebSocket về Admin Frontend
    
    AdminUI-->>Teacher: Thông báo "Đã sinh thành công N câu hỏi", tải lại danh sách câu hỏi
```

---

## 4. Luồng Thu Thập Metrics & Tự Động Bắn Cảnh Báo (Monitoring & Alerting)

Bộ giải pháp Observability theo dõi liên tục trạng thái của Backend và phát hiện sự cố sớm:

```mermaid
sequenceDiagram
    autonumber
    participant App as Spring Boot Backend
    participant Prom as Prometheus Server
    participant AM as Alertmanager
    participant Tele as Kênh Telegram Quản Trị
    participant Dev as Đội ngũ Kỹ Thuật

    loop Mỗi chu kỳ 10 giây (Scrape Interval)
        Prom->>App: GET /actuator/prometheus
        App-->>Prom: Trả về các số liệu (JVM Heap, CPU, DB Connection Pool, HTTP 5xx)
        Prom->>Prom: Đánh giá với quy tắc alert_rules.yml
    end

    Note over App, Prom: Giả sử phát sinh sự cố (Bộ nhớ Heap > 90% hoặc Crash)
    App-->>Prom: Số liệu vi phạm ngưỡng trong hơn 1 phút
    Prom->>Prom: Chuyển trạng thái Rule từ PENDING sang FIRING
    Prom->>AM: POST /api/v2/alerts (Thông báo sự cố HighJvmHeapUsage)
    
    AM->>AM: Gom nhóm cảnh báo (Group), khử trùng lặp (Deduplicate)
    AM->>AM: Định dạng nội dung tin nhắn HTML tiếng Việt
    AM->>Tele: Gửi tin nhắn sự cố khẩn cấp qua Telegram Bot API
    Tele-->>Dev: Tin nhắn nổi bật trên điện thoại/máy tính kỹ thuật viên
    
    Dev->>App: Kiểm tra log qua Loki/Grafana và xử lý kịp thời
    
    Note over App, Tele: Khi sự cố được khắc phục thành công
    Prom->>App: Metrics trở về trạng thái an toàn
    Prom->>AM: Gửi tín hiệu RESOLVED
    AM->>Tele: Bắn tin nhắn thông báo sự cố đã được giải quyết
```
