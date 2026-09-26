# Sơ Đồ Luồng Hoạt Động Các Chức Năng Chính (Workflows)

Tài liệu này mô tả chi tiết bằng sơ đồ tuần tự (Sequence Diagram) cho các nghiệp vụ trọng tâm trong hệ thống Quiz VNUA.

> [!TIP]
> Để xem chi tiết các **Biểu đồ hoạt động UML (Activity Diagrams)** với đầy đủ các bước rẽ nhánh điều kiện, xử lý lỗi và lưu đồ tác vụ, vui lòng xem tài liệu: **[Biểu Đồ Hoạt Động (Activity Diagrams)](./activity-diagrams.md)**.

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

---

## 5. Luồng Quên Mật Khẩu & Khôi Phục Qua Mã OTP Email (Forgot Password & OTP Reset)

Quy trình xác thực đa bước để đặt lại mật khẩu an toàn sử dụng mã OTP 6 số lưu tạm trong Redis Cache kèm thời hạn TTL = 5 phút:

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant Client as React Client (Frontend)
    participant OtpAPI as Spring Boot (OtpController)
    participant Redis as Redis Cache
    participant Queue as RabbitMQ (notification.email.queue)
    participant Mailer as Email Worker & SMTP
    participant DB as MySQL Database

    User->>Client: Nhập email & bấm "Gửi mã OTP"
    Client->>OtpAPI: POST /api/v1/otp/send { email }
    OtpAPI->>DB: Kiểm tra email có tồn tại trong hệ thống
    DB-->>OtpAPI: Email hợp lệ (User entity)
    OtpAPI->>OtpAPI: Sinh mã OTP ngẫu nhiên 6 chữ số
    OtpAPI->>Redis: Lưu OTP theo key reset_otp:{email} với TTL = 300s (5 phút)
    OtpAPI->>Queue: Đẩy email task vào RabbitMQ
    OtpAPI-->>Client: HTTP 200 ("Đã gửi mã xác thực tới hòm thư")
    Queue->>Mailer: Rút task gửi email
    Mailer-->>User: Gửi email chứa mã OTP 6 số tới hộp thư

    Note over User, Client: Người dùng kiểm tra email và nhập OTP
    User->>Client: Nhập mã OTP 6 số & bấm "Xác nhận OTP"
    Client->>OtpAPI: POST /api/v1/otp/verify { email, otp }
    OtpAPI->>Redis: So khớp mã OTP trong cache & kiểm tra TTL
    Redis-->>OtpAPI: Mã OTP hợp lệ & chưa hết hạn
    OtpAPI->>Redis: Cấp phát reset_token tạm thời (TTL 10 phút)
    OtpAPI-->>Client: HTTP 200 kèm reset_token
    Client-->>User: Chuyển sang màn hình Nhập mật khẩu mới

    Note over User, DB: Đặt mật khẩu mới
    User->>Client: Nhập mật khẩu mới & bấm "Đổi mật khẩu"
    Client->>OtpAPI: POST /api/v1/otp/reset { resetToken, newPassword }
    OtpAPI->>Redis: Kiểm tra resetToken hợp lệ
    OtpAPI->>OtpAPI: Mã hóa mật khẩu mới bằng thuật toán BCrypt
    OtpAPI->>DB: Cập nhật password hash mới vào bảng User
    OtpAPI->>DB: Thu hồi toàn bộ RefreshToken cũ của người dùng
    OtpAPI->>Redis: Xóa reset_token
    OtpAPI-->>Client: HTTP 200 ("Đặt lại mật khẩu thành công")
    Client-->>User: Hiển thị thông báo thành công và chuyển hướng đến trang Đăng nhập
```

---

## 6. Luồng Trợ Lý AI: Phân Tích Kết Quả Bài Thi & Giải Thích Câu Hỏi (AI Exam Analysis & Explanation)

Tích hợp Google Gemini 2.0 Flash / OpenAI API để cung cấp dịch vụ gia sư ảo học tập cá nhân hóa:

```mermaid
sequenceDiagram
    autonumber
    actor Student as Sinh viên
    participant Client as React Client (Frontend)
    participant AiAPI as Spring Boot (AiController)
    participant ExamService as UserExam Service
    participant Gemini as Google Gemini 2.0 Flash API
    participant DB as MySQL Database

    Note over Student, Gemini: 1. Tính năng AI Phân Tích Chuyên Sâu Kết Quả Bài Thi
    Student->>Client: Bấm "Yêu cầu AI Phân tích bài thi"
    Client->>AiAPI: POST /api/v1/ai/analyze-exam-result { userExamId }
    AiAPI->>ExamService: Lấy chi tiết bài thi (điểm số, danh sách câu đúng/sai theo chương)
    ExamService->>DB: Truy vấn UserExam, Question, Subject
    DB-->>ExamService: Dữ liệu chi tiết kết quả làm bài
    AiAPI->>AiAPI: Xây dựng System Prompt phân tích sư phạm & cấu trúc JSON mong đợi
    AiAPI->>Gemini: POST /v1beta/models/gemini-2.0-flash:generateContent
    Gemini-->>AiAPI: Trả về JSON (Điểm mạnh, điểm yếu theo chương, lời khuyên ôn tập)
    AiAPI->>AiAPI: Parse sang ExamAnalysisResponse DTO
    AiAPI-->>Client: HTTP 200 kèm dữ liệu phân tích
    Client-->>Student: Render thẻ ExamAiAnalysisCard trực quan

    Note over Student, Gemini: 2. Tính năng AI Giải Thích Chi Tiết Từng Câu Hỏi
    Student->>Client: Bấm "Hỏi AI giải thích câu hỏi này"
    Client->>AiAPI: POST /api/v1/ai/explain-question { questionId, selectedAnswerId }
    AiAPI->>DB: Đọc nội dung câu hỏi, tất cả phương án, đáp án đúng và lý thuyết liên quan
    DB-->>AiAPI: Dữ liệu câu hỏi đầy đủ
    AiAPI->>Gemini: Gọi API giải thích tại sao đáp án chọn là đúng/sai & bóc tách bẫy đề thi
    Gemini-->>AiAPI: Trả về văn bản giải thích chi tiết theo Markdown
    AiAPI-->>Client: HTTP 200 kèm ExplainQuestionResponse
    Client-->>Student: Hiển thị khối AiExplanationBlock ngay dưới câu hỏi
```

---

## 7. Luồng Phân Phối Thông Báo Realtime Qua WebSocket STOMP (Realtime Notifications)

Cơ chế Push Notification thời gian thực kết hợp lưu trữ lịch sử trong cơ sở dữ liệu:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản trị viên
    participant AdminUI as Admin Frontend
    participant Server as Spring Boot API Server
    participant Broker as WebSocket STOMP SimpleBroker
    participant DB as MySQL Database
    actor Student as Sinh viên (Client Web)

    Note over Student, Server: Sinh viên đăng nhập và thiết lập kết nối WebSocket
    Student->>Server: Handshake WebSocket qua endpoint /ws (kèm JWT Cookie)
    Server->>Server: CookieJwtHandshakeInterceptor xác thực token & gắn userId
    Server-->>Student: Handshake thành công (Switching Protocols HTTP 101)
    Student->>Broker: SUBSCRIBE /topic/notifications (Kênh chung)
    Student->>Broker: SUBSCRIBE /user/queue/notifications (Kênh riêng cá nhân)

    Note over Admin, Student: Quản trị viên phát đi thông báo mới
    Admin->>AdminUI: Soạn thông báo (Tiêu đề, nội dung, phạm vi: GLOBAL/SUBJECT/USER)
    AdminUI->>Server: POST /api/v1/admin/notifications
    Server->>DB: Lưu bản ghi Notification & UserNotification (Status: UNREAD)
    
    alt Thông báo toàn hệ thống (GLOBAL)
        Server->>Broker: SEND /topic/notifications
    else Thông báo theo môn học (SUBJECT)
        Server->>Broker: SEND /topic/subjects/{subjectId}
    else Thông báo cá nhân (USER)
        Server->>Broker: SEND /user/{userId}/queue/notifications
    end

    Broker-->>Student: Đẩy bản tin thông báo thời gian thực xuống Client
    Student->>Student: NotificationProvider nhận tin, phát âm thanh pop & tăng badge chưa đọc
    Student-->>Student: Hiển thị NotificationPopup góc phải màn hình
```

---

## 8. Luồng Đăng Ký Tài Khoản & Kích Hoạt Qua Email (Registration & Verification)

Quy trình đăng ký người dùng mới đảm bảo xác minh danh tính qua email trước khi cho phép hoạt động:

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng mới
    participant Client as React Client
    participant AuthAPI as Spring Boot (AuthController)
    participant Queue as RabbitMQ (notification.email.queue)
    participant Worker as Email Worker
    participant DB as MySQL Database

    User->>Client: Nhập form đăng ký (Username, Email, Mật khẩu, Họ tên)
    Client->>AuthAPI: POST /api/v1/auth/register
    AuthAPI->>DB: Kiểm tra xem Username hoặc Email đã tồn tại chưa
    DB-->>AuthAPI: Chưa tồn tại (Hợp lệ)
    AuthAPI->>AuthAPI: Băm mật khẩu bằng BCrypt
    AuthAPI->>DB: Tạo bản ghi User mới (Status: INACTIVE / DISABLED)
    AuthAPI->>AuthAPI: Sinh mã xác thực email ngẫu nhiên (Verification Token)
    AuthAPI->>DB: Lưu Verification Token với thời hạn 24 giờ
    AuthAPI->>Queue: Đẩy email task vào RabbitMQ
    AuthAPI-->>Client: HTTP 201 Created ("Đăng ký thành công, vui lòng kiểm tra email")
    Client-->>User: Hiển thị thông báo hướng dẫn kích hoạt hộp thư

    Queue->>Worker: Tiếp nhận task gửi email kích hoạt
    Worker-->>User: Gửi email chứa liên kết kích hoạt /verify-email?token=...

    User->>Client: Bấm vào đường dẫn kích hoạt trong email
    Client->>AuthAPI: GET /api/v1/auth/verify-email?token=...
    AuthAPI->>DB: Kiểm tra token hợp lệ và còn hạn
    DB-->>AuthAPI: Token hợp lệ
    AuthAPI->>DB: Cập nhật trạng thái User thành ACTIVE
    AuthAPI->>DB: Xóa mã verification token đã dùng
    AuthAPI-->>Client: HTTP 200 ("Xác thực email thành công")
    Client-->>User: Chuyển hướng người dùng sang trang Đăng nhập thành công
```

---

## 9. Luồng Trợ Lý AI: Sinh Lộ Trình Học Tập Cá Nhân Hóa (AI Learning Roadmap)

Quy trình phân tích dữ liệu lịch sử thi và gọi Google Gemini 2.0 Flash để sinh lộ trình học tập cá nhân hóa:

```mermaid
sequenceDiagram
    autonumber
    actor Student as Sinh viên
    participant Client as React Client (Frontend)
    participant AiAPI as Spring Boot (AiController)
    participant RoadmapService as AiRoadmapService
    participant Cache as Redis Cache
    participant DB as MySQL Database
    participant Gemini as Google Gemini 2.0 Flash API

    Student->>Client: Mở tab "Lộ trình học tập" trong trang Cá nhân
    Client->>AiAPI: GET /api/v1/ai/roadmap?refresh=false
    AiAPI->>RoadmapService: getPersonalizedRoadmap(currentUser, refresh)
    RoadmapService->>Cache: Kiểm tra cache roadmap:{userId}
    
    alt Đã có trong Cache và không yêu cầu refresh
        Cache-->>RoadmapService: Trả về LearningRoadmapResponse đã lưu
    else Chưa có trong Cache hoặc refresh=true
        RoadmapService->>DB: Truy vấn lịch sử UserExam & các câu hỏi sai
        DB-->>RoadmapService: Dữ liệu phân tích năng lực
        RoadmapService->>RoadmapService: Xây dựng System Prompt phân tích sư phạm cá nhân
        RoadmapService->>Gemini: POST /v1beta/models/gemini-2.0-flash:generateContent
        Gemini-->>RoadmapService: Trả về JSON danh sách RoadmapStepDto
        RoadmapService->>RoadmapService: Parse JSON sang LearningRoadmapResponse
        RoadmapService->>Cache: Lưu vào Redis Cache kèm TTL
    end

    RoadmapService-->>AiAPI: Trả về LearningRoadmapResponse
    AiAPI-->>Client: HTTP 200 kèm lộ trình chi tiết
    Client-->>Student: Render giao diện Timeline các chặng ôn tập
```

---

## 10. Luồng Truy Vấn Bảng Xếp Hạng Kèm Cơ Chế Redis Cache & Tự Động Xóa Bộ Đệm (Leaderboard Caching & Eviction)

Tối ưu hóa hiệu năng truy vấn cho bảng xếp hạng có hàng nghìn lượt truy cập và cơ chế làm mới dữ liệu tự động:

```mermaid
sequenceDiagram
    autonumber
    actor User as Thí sinh / Khách
    participant Client as React Client
    participant RankAPI as Spring Boot (UserExamController)
    participant RankService as RankingService
    participant Cache as Redis Cache
    participant DB as MySQL Database
    actor OtherStudent as Thí sinh khác

    Note over User, DB: 1. Truy vấn Bảng xếp hạng có Caching
    User->>Client: Mở trang Bảng xếp hạng (chọn Tuần/Tháng, Môn học, Tiêu chí)
    Client->>RankAPI: GET /api/v1/public/rankings?period=all&criteria=total&limit=10
    RankAPI->>RankService: getRankings(period, subject, criteria, limit, userId)
    RankService->>Cache: GET rankings:{period}:{subject}:{criteria}

    alt Cache Hit (Đã có sẵn trong Redis)
        Cache-->>RankService: Trả về RankingResponse tức thì (< 5ms)
    else Cache Miss (Chưa có trong Redis)
        RankService->>DB: Truy vấn tổng hợp UserExam, tính điểm tích lũy Top N
        DB-->>RankService: Danh sách thí sinh & điểm số
        RankService->>RankService: Xác định vị trí xếp hạng của người dùng hiện tại
        RankService->>Cache: SET rankings:{...} với TTL 10 phút
    end

    RankService-->>RankAPI: Trả về RankingResponse
    RankAPI-->>Client: HTTP 200 kèm danh sách Top thí sinh
    Client-->>User: Hiển thị Bảng vinh danh và vị trí cá nhân

    Note over OtherStudent, Cache: 2. Tự động xóa sạch Cache khi có bài thi mới nộp
    OtherStudent->>Client: Nộp bài thi mới
    Client->>RankAPI: POST /api/v1/exam-attempts/{id}/submit
    RankAPI->>DB: Cập nhật điểm thi vào UserExam
    RankAPI->>Cache: Kích hoạt @CacheEvict(value = "ranking", allEntries = true)
    Cache-->>RankAPI: Đã dọn sạch toàn bộ cache ranking cũ
    Note over Cache: Lần truy vấn kế tiếp sẽ tự động tính toán lại dữ liệu mới nhất
```


