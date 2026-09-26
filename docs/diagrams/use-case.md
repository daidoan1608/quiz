# Sơ Đồ Ca Sử Dụng Hệ Thống (Use Case Diagrams)

Tài liệu này đặc tả toàn bộ các ca sử dụng (Use Cases) của hệ thống **Quiz VNUA**, bao gồm sơ đồ phân rã chức năng tổng thể, các sơ đồ ca sử dụng theo từng phân hệ nghiệp vụ, và bảng đặc tả chi tiết (Use Case Specifications) phục vụ báo cáo đồ án và kiểm thử phần mềm.

---

## Mục Lục
1. [Danh Sách Tác Nhân Hệ Thống (Actors)](#1-danh-sách-tác-nhân-hệ-thống-actors)
2. [Sơ Đồ Ca Sử Dụng Tổng Thể (System Overview Use Case)](#2-sơ-đồ-ca-sử-dụng-tổng-thể-system-overview-use-case)
3. [Phân Hệ 1: Xác Thực & Tài Khoản (Authentication & Account)](#3-phân-hệ-1-xác-thực--tài-khoản-authentication--account)
4. [Phân Hệ 2: Khảo Thí & Luyện Tập (Exam Taking & Practice)](#4-phân-hệ-2-khảo-thí--luyện-tập-exam-taking--practice)
5. [Phân Hệ 3: Trợ Lý Học Tập AI (AI Study Assistant)](#5-phân-hệ-3-trợ-lý-học-tập-ai-ai-study-assistant)
6. [Phân Hệ 4: Quản Trị Ngân Hàng Câu Hỏi & Đề Thi (Question Bank & Exam Admin)](#6-phân-hệ-4-quản-trị-ngân-hàng-câu-hỏi--đề-thi-question-bank--exam-admin)
7. [Phân Hệ 5: Vận Hành Hệ Thống, Phân Quyền & Báo Cáo (Administration & Analytics)](#7-phân-hệ-5-vận-hành-hệ-thống-phân-quyền--báo-cáo-administration--analytics)
8. [Phân Hệ 6: Thông Báo Thời Gian Thực & Kho Tài Liệu (Notifications & Study Documents)](#8-phân-hệ-6-thông-báo-thời-gian-thực--kho-tài-liệu-notifications--study-documents)
9. [Bảng Đặc Tả Chi Tiết Các Use Case Trọng Tâm (Use Case Specifications)](#9-bảng-đặc-tả-chi-tiết-các-use-case-trọng-tâm-use-case-specifications)

---

## 1. Danh Sách Tác Nhân Hệ Thống (Actors)

Theo đặc tả UML 2.5 (ISO/IEC 19505), tác nhân (Actor) được phân loại thành Tác nhân con người (Human Actor) và Tác nhân hệ thống ngoài (System Actor):

| Tác nhân (Actor) | Phân loại UML Stereotype | Mô tả vai trò và quyền hạn |
| :--- | :---: | :--- |
| **Sinh viên / Thí sinh (Student / User)** | `«actor»` | Người dùng cuối tham gia học tập, ôn luyện kiến thức theo chương, làm bài thi trắc nghiệm, nhận kết quả, hỏi trợ lý AI và xem bảng xếp hạng. |
| **Giảng viên / Điều hành viên (MOD)** | `«actor»` | Quản lý nội dung học thuật trong phạm vi môn học được phân quyền: Quản lý ngân hàng câu hỏi, import Excel, tạo và xuất bản đề thi, chia sẻ tài liệu. |
| **Quản trị viên hệ thống (Super ADMIN)** | `«actor»` | Toàn quyền kiểm soát hệ thống: Quản lý tài khoản người dùng, phân quyền nhóm quản trị (RBAC), phát chiến dịch thông báo, xem Audit Log, cấu hình hệ thống và xuất báo cáo CSV. |
| **Google OAuth Service** | `«actor» «system»` | Dịch vụ ngoài: Xác thực danh tính người dùng thông qua Google ID Token (One-Tap / OAuth2). |
| **Google Gemini API** | `«actor» «system»` | Dịch vụ ngoài: Mô hình ngôn ngữ lớn (LLM) hỗ trợ sinh câu hỏi từ tài liệu, giải thích chi tiết đáp án và phân tích lộ trình học. |
| **Mail Server (SMTP)** | `«actor» «system»` | Dịch vụ ngoài: Gửi email kích hoạt tài khoản, mã xác thực OTP khôi phục mật khẩu và thông báo điểm thi. |
| **Telegram Bot API** | `«actor» «system»` | Dịch vụ ngoài: Tiếp nhận cảnh báo sự cố máy chủ thời gian thực từ Alertmanager để gửi tới nhóm kỹ thuật. |

---

## 2. Sơ Đồ Ca Sử Dụng Tổng Thể (System Overview Use Case)

Thể hiện ranh giới hệ thống (System Boundary) và các nhóm chức năng chính mà từng tác nhân được phép tương tác theo chuẩn quy ước hình học UML (Hình chữ nhật cho Ranh giới hệ thống, Hình Oval cho Ca sử dụng):

```mermaid
flowchart LR
    %% Actors with standard UML notation
    Student["«actor»\nSinh viên / Thí sinh"]
    Teacher["«actor»\nĐiều hành viên (MOD)"]
    Admin["«actor»\nQuản trị viên (ADMIN)"]
    ExtServices["«actor»\n«system»\nDịch vụ ngoài\n(AI / OAuth / SMTP)"]

    subgraph SystemBoundary["Hệ Thống Quiz VNUA"]
        UC_Auth(["Quản lý Xác thực & Hồ sơ"])
        UC_Exam(["Khảo thí & Luyện tập trắc nghiệm"])
        UC_AI(["Tương tác Trợ lý học tập AI"])
        UC_Notify(["Nhận thông báo thời gian thực"])
        UC_Doc(["Tra cứu & Tải tài liệu môn học"])
        
        UC_QManage(["Quản lý Ngân hàng câu hỏi & Import Excel"])
        UC_ExamManage(["Quản lý & Cấu hình Ma trận Đề thi"])
        UC_ShareDoc(["Chia sẻ & Quản lý Tài liệu học tập"])
        
        UC_UserManage(["Quản lý Người dùng & Khóa tài khoản"])
        UC_RBAC(["Phân quyền Nhóm quản trị (RBAC)"])
        UC_Campaign(["Phát chiến dịch thông báo"])
        UC_Audit(["Xem nhật ký kiểm toán (Audit Logs)"])
        UC_Stats(["Xem thống kê Dashboard & Xuất CSV"])
    end

    %% Student Relations
    Student --- UC_Auth
    Student --- UC_Exam
    Student --- UC_AI
    Student --- UC_Notify
    Student --- UC_Doc

    %% MOD Relations
    Teacher --- UC_Auth
    Teacher --- UC_QManage
    Teacher --- UC_ExamManage
    Teacher --- UC_ShareDoc
    Teacher --- UC_AI

    %% ADMIN Relations
    Admin --- UC_Auth
    Admin --- UC_QManage
    Admin --- UC_ExamManage
    Admin --- UC_UserManage
    Admin --- UC_RBAC
    Admin --- UC_Campaign
    Admin --- UC_Audit
    Admin --- UC_Stats

    %% External Systems Relations
    UC_Auth -.-> ExtServices
    UC_AI -.-> ExtServices
```

---

## 3. Phân Hệ 1: Xác Thực & Tài Khoản (Authentication & Account)

Bao gồm toàn bộ các ca sử dụng liên quan đến định danh, bảo mật phiên làm việc và quản lý thông tin cá nhân:

```mermaid
flowchart LR
    ActorUser["«actor»\nNgười dùng (Tất cả vai trò)"]
    OAuthServer["«actor»\n«system»\nGoogle OAuth"]
    SmtpServer["«actor»\n«system»\nMail Server (SMTP)"]

    subgraph AuthSubsystem["Phân Hệ Xác Thực & Tài Khoản"]
        UC_Register(["Đăng ký tài khoản mới"])
        UC_VerifyEmail(["Kích hoạt tài khoản qua Email"])
        UC_Login(["Đăng nhập hệ thống"])
        UC_LoginGoogle(["Đăng nhập bằng Google"])
        UC_SilentRefresh(["Tự động làm mới phiên Token"])
        UC_ForgotPassword(["Quên mật khẩu"])
        UC_VerifyOtp(["Xác thực mã OTP Email"])
        UC_ResetPassword(["Đặt lại mật khẩu mới"])
        UC_ChangePassword(["Đổi mật khẩu tài khoản"])
        UC_SetPassword(["Thiết lập mật khẩu riêng"])
        UC_UpdateProfile(["Cập nhật hồ sơ & Địa chỉ VN"])
        UC_UploadAvatar(["Thay đổi ảnh đại diện"])
        UC_Logout(["Đăng xuất"])

        %% Relationships
        UC_VerifyEmail -.->|«extend»| UC_Register
        UC_ForgotPassword -.->|«include»| UC_VerifyOtp
        UC_VerifyOtp -.->|«include»| UC_ResetPassword
        UC_SilentRefresh -.->|«extend»| UC_Login
    end

    ActorUser --- UC_Register
    ActorUser --- UC_Login
    ActorUser --- UC_LoginGoogle
    ActorUser --- UC_ForgotPassword
    ActorUser --- UC_ChangePassword
    ActorUser --- UC_SetPassword
    ActorUser --- UC_UpdateProfile
    ActorUser --- UC_UploadAvatar
    ActorUser --- UC_Logout

    UC_LoginGoogle -.-> OAuthServer
    UC_VerifyEmail -.-> SmtpServer
    UC_VerifyOtp -.-> SmtpServer
```

---

## 4. Phân Hệ 2: Khảo Thí & Luyện Tập (Exam Taking & Practice)

Phân hệ dành riêng cho thí sinh tham gia làm bài kiểm tra tính giờ quy chế hoặc tự do luyện tập nâng cao kiến thức:

```mermaid
flowchart LR
    Student["«actor»\nSinh viên / Thí sinh"]

    subgraph ExamSubsystem["Phân Hệ Khảo Thí & Luyện Tập"]
        UC_BrowseSubjects(["Duyệt danh mục Môn học"])
        UC_ToggleFavorite(["Đánh dấu môn học yêu thích"])
        UC_PracticeChapter(["Luyện tập theo từng Chương"])
        UC_SmartWrong(["Ôn tập thông minh các câu từng sai"])
        UC_StartExam(["Bắt đầu / Tiếp tục bài thi"])
        UC_AnswerQuestion(["Chọn đáp án câu hỏi"])
        UC_Autosave(["Tự động lưu đáp án ngầm"])
        UC_MarkQuestion(["Đánh dấu câu hỏi nghi vấn"])
        UC_SubmitExam(["Nộp bài thi trắc nghiệm"])
        UC_ViewResult(["Xem bảng điểm & kết quả thi"])
        UC_ReviewExam(["Xem lại chi tiết câu đúng/sai"])
        UC_ViewHistory(["Xem lịch sử các lần thi"])
        UC_ViewRanking(["Tra cứu Bảng xếp hạng"])

        %% Relationships
        UC_SmartWrong -.->|«extend»| UC_PracticeChapter
        UC_StartExam -.->|«include»| UC_AnswerQuestion
        UC_AnswerQuestion -.->|«include»| UC_Autosave
        UC_MarkQuestion -.->|«extend»| UC_AnswerQuestion
        UC_StartExam -.->|«include»| UC_SubmitExam
        UC_SubmitExam -.->|«include»| UC_ViewResult
        UC_ReviewExam -.->|«extend»| UC_ViewResult
    end

    Student --- UC_BrowseSubjects
    Student --- UC_ToggleFavorite
    Student --- UC_PracticeChapter
    Student --- UC_StartExam
    Student --- UC_ViewHistory
    Student --- UC_ViewRanking
```

---

## 5. Phân Hệ 3: Trợ Lý Học Tập AI (AI Study Assistant)

Tích hợp trí tuệ nhân tạo tạo sinh nhằm tăng cường hiệu quả tiếp thu bài học và khắc phục các lỗ hổng kiến thức:

```mermaid
flowchart LR
    Student["«actor»\nSinh viên"]
    Teacher["«actor»\nGiảng viên / Admin"]
    GeminiApi["«actor»\n«system»\nGoogle Gemini API"]

    subgraph AiSubsystem["Phân Hệ Trợ Lý AI"]
        UC_AiExplain(["Hỏi AI giải thích câu hỏi"])
        UC_AiAnalyze(["Yêu cầu AI phân tích sâu bài thi"])
        UC_AiRoadmap(["Xem lộ trình học tập cá nhân hóa"])
        UC_AiGenerate(["Sinh câu hỏi từ tài liệu PDF/Word"])

        UC_ViewDetail(["Trang xem lại câu hỏi thi"])
        UC_ViewScore(["Trang kết quả bài thi"])
        UC_AccountPage(["Trang thông tin cá nhân"])
        UC_AdminQ(["Ngân hàng câu hỏi quản trị"])

        %% Include / Extend
        UC_AiExplain -.->|«extend»| UC_ViewDetail
        UC_AiAnalyze -.->|«extend»| UC_ViewScore
        UC_AiRoadmap -.->|«extend»| UC_AccountPage
        UC_AiGenerate -.->|«extend»| UC_AdminQ
    end

    Student --- UC_AiExplain
    Student --- UC_AiAnalyze
    Student --- UC_AiRoadmap
    Teacher --- UC_AiGenerate

    UC_AiExplain -.-> GeminiApi
    UC_AiAnalyze -.-> GeminiApi
    UC_AiRoadmap -.-> GeminiApi
    UC_AiGenerate -.-> GeminiApi
```

---

## 6. Phân Hệ 4: Quản Trị Ngân Hàng Câu Hỏi & Đề Thi (Question Bank & Exam Admin)

Dành cho Giảng viên (`MOD`) và Quản trị viên (`ADMIN`) quản trị vòng đời của câu hỏi, bộ đề thi và học liệu:

```mermaid
flowchart LR
    Teacher["«actor»\nGiảng viên (MOD)"]
    Admin["«actor»\nQuản trị viên (ADMIN)"]

    subgraph CatalogSubsystem["Phân Hệ Ngân Hàng Câu Hỏi & Đề Thi"]
        UC_ManageCategory(["Quản lý Khối ngành & Môn học"])
        UC_ManageChapter(["Quản lý Chương môn học"])
        
        UC_CreateSingleQ(["Thêm câu hỏi đơn lẻ kèm LaTeX & Ảnh"])
        UC_EditQ(["Chỉnh sửa nội dung & đáp án câu hỏi"])
        UC_ImportExcel(["Import câu hỏi từ Excel hàng loạt"])
        UC_PreviewExcel(["Xem trước & Kiểm tra lỗi file Excel"])
        
        UC_CreateFixedExam(["Tạo đề thi chọn câu hỏi thủ công"])
        UC_CreateMatrixExam(["Tạo đề thi theo Ma trận ngẫu nhiên"])
        UC_PublishExam(["Xuất bản / Thu hồi đề thi"])
        UC_ExportPdf(["Xuất đề thi ra file PDF để in ấn"])
        
        UC_SoftDelete(["Xóa mềm Đề thi / Câu hỏi"])
        UC_RestoreTrash(["Xem Thùng rác & Khôi phục dữ liệu"])
        UC_ManageSharedDocs(["Quản lý kho Tài liệu học tập chia sẻ"])

        %% Dependencies
        UC_ImportExcel -.->|«include»| UC_PreviewExcel
        UC_RestoreTrash -.->|«extend»| UC_SoftDelete
    end

    Teacher --- UC_ManageChapter
    Teacher --- UC_CreateSingleQ
    Teacher --- UC_EditQ
    Teacher --- UC_ImportExcel
    Teacher --- UC_CreateFixedExam
    Teacher --- UC_CreateMatrixExam
    Teacher --- UC_PublishExam
    Teacher --- UC_ExportPdf
    Teacher --- UC_ManageSharedDocs

    Admin --- UC_ManageCategory
    Admin --- UC_SoftDelete
    Admin --- UC_RestoreTrash
```

---

## 7. Phân Hệ 5: Vận Hành Hệ Thống, Phân Quyền & Báo Cáo (Administration & Analytics)

Dành riêng cho Quản trị viên cấp cao (`ADMIN`) kiểm soát an toàn thông tin, theo dõi kiểm toán và xuất báo cáo:

```mermaid
flowchart LR
    Admin["«actor»\nQuản trị viên (ADMIN)"]
    AuditLogger["«actor»\n«system»\nHệ Thống Kiểm Toán"]

    subgraph AdminSubsystem["Phân Hệ Quản Trị Hệ Thống & Báo Cáo"]
        UC_UserManagement(["Quản lý danh sách Người dùng"])
        UC_ToggleUserStatus(["Khóa / Mở khóa tài khoản người dùng"])
        UC_AssignRole(["Phân vai trò: USER / MOD / ADMIN"])
        
        UC_ManageAdminGroup(["Quản lý Nhóm quyền (AdminGroup)"])
        UC_MatrixPermission(["Cấu hình Ma trận phân quyền RBAC"])
        UC_AssignModToGroup(["Gán MOD vào Nhóm quyền"])
        
        UC_CreateNotification(["Phát chiến dịch thông báo Global/Subject/User"])
        UC_TrackAuditLog(["Tra cứu Nhật ký kiểm toán (Audit Logs)"])
        UC_ViewAnalytics(["Xem Dashboard Thống kê biểu đồ"])
        UC_ExportCsv(["Xuất báo cáo dữ liệu dạng file CSV"])

        %% Include / Extend
        UC_ToggleUserStatus -.->|«extend»| UC_UserManagement
        UC_AssignRole -.->|«extend»| UC_UserManagement
        UC_ManageAdminGroup -.->|«include»| UC_MatrixPermission
        UC_ManageAdminGroup -.->|«include»| UC_AssignModToGroup
    end

    Admin --- UC_UserManagement
    Admin --- UC_ManageAdminGroup
    Admin --- UC_CreateNotification
    Admin --- UC_TrackAuditLog
    Admin --- UC_ViewAnalytics
    Admin --- UC_ExportCsv

    UC_TrackAuditLog -.-> AuditLogger
```

---

## 8. Phân Hệ 6: Thông Báo Thời Gian Thực & Kho Tài Liệu (Notifications & Study Documents)

Đặc tả các ca sử dụng tương tác kênh thông báo đẩy WebSocket STOMP và hệ thống chia sẻ học liệu môn học:

```mermaid
flowchart LR
    Student["«actor»\nSinh viên / Thí sinh"]
    Teacher["«actor»\nGiảng viên / Quản trị"]
    WsBroker["«actor»\n«system»\nWebSocket STOMP Broker"]

    subgraph NotifyDocSubsystem["Phân Hệ Thông Báo & Học Liệu"]
        UC_ReceiveWs(["Nhận thông báo đẩy thời gian thực"])
        UC_ViewListNotify(["Xem danh sách thông báo & Bộ lọc"])
        UC_MarkReadOne(["Đánh dấu một thông báo đã đọc"])
        UC_MarkReadAll(["Đánh dấu tất cả thông báo đã đọc"])
        UC_NavTarget(["Bấm thông báo điều hướng tới bài thi"])
        
        UC_BrowseDoc(["Tra cứu kho tài liệu theo môn học"])
        UC_DownloadDoc(["Tải file tài liệu (.pdf, .docx, .xlsx)"])
        UC_UploadDoc(["Tải lên & gắn tài liệu vào môn học"])
        UC_DeleteDoc(["Xóa tài liệu học tập"])

        %% Relationships
        UC_ReceiveWs -.->|«include»| UC_ViewListNotify
        UC_MarkReadOne -.->|«extend»| UC_ViewListNotify
        UC_MarkReadAll -.->|«extend»| UC_ViewListNotify
        UC_NavTarget -.->|«extend»| UC_ViewListNotify
        UC_BrowseDoc -.->|«include»| UC_DownloadDoc
    end

    Student --- UC_ReceiveWs
    Student --- UC_ViewListNotify
    Student --- UC_BrowseDoc
    Student --- UC_DownloadDoc

    Teacher --- UC_UploadDoc
    Teacher --- UC_DeleteDoc

    UC_ReceiveWs -.-> WsBroker
```

---

## 9. Bảng Đặc Tả Chi Tiết Các Use Case Trọng Tâm (Use Case Specifications)

### Ca Sử Dụng 1: `UC-EXAM-01` - Bắt Đầu & Nộp Bài Thi Trắc Nghiệm Trực Tuyến

* **Mã ca sử dụng:** `UC-EXAM-01`
* **Tên ca sử dụng:** Làm bài thi và nộp bài trực tuyến
* **Tác nhân chính:** Sinh viên (Thí sinh)
* **Tiền điều kiện (Pre-conditions):**
  1. Thí sinh đã đăng nhập tài khoản có trạng thái `ACTIVE`.
  2. Đề thi đang ở trạng thái `PUBLISHED` và nằm trong khung giờ mở thi.
  3. Thí sinh chưa vượt quá số lượt thi tối đa (`maxAttempts`) của đề.
* **Hậu điều kiện (Post-conditions):**
  1. Bản ghi `UserExam` được cập nhật trạng thái `SUBMITTED`, lưu điểm số và thời gian hoàn thành.
  2. Bộ đệm session bài thi trong Redis được giải phóng.
  3. Bảng điểm được gửi tự động về hòm thư sinh viên qua RabbitMQ.
* **Luồng sự kiện chính (Basic Flow):**
  1. Thí sinh chọn đề thi và nhấn nút *"Bắt đầu làm bài thi"*.
  2. Hệ thống gọi `POST /api/v1/exam-attempts/start`, tạo bản ghi `UserExam` trạng thái `IN_PROGRESS`, sao lưu snapshot câu hỏi vào `UserExamQuestion` và khởi tạo cache Redis.
  3. Hệ thống trả về đề thi, giao diện bắt đầu đếm ngược thời gian làm bài theo giây.
  4. Thí sinh đọc câu hỏi và chọn đáp án $\rightarrow$ Client tự động gửi `PUT /api/v1/exam-attempts/{id}/answers` lưu vết tức thì vào Redis Cache (Autosave).
  5. Thí sinh có thể đánh dấu câu hỏi nghi vấn để kiểm tra lại qua bảng điều hướng.
  6. Sau khi hoàn thành, thí sinh bấm nút *"Nộp bài thi"* (hoặc khi đồng hồ đếm ngược về 00:00).
  7. Client gửi `POST /api/v1/exam-attempts/{id}/submit`.
  8. Backend đóng gói thông điệp `ExamSubmissionMessage` đẩy vào hàng đợi RabbitMQ `exam.submission.queue` và phản hồi ngay mã `HTTP 202 Accepted`.
  9. Consumer ngầm chấm điểm, lưu kết quả MySQL và gửi email kết quả.
  10. Client hiển thị kết quả bài thi: Điểm số, số câu đúng/sai, biểu đồ phân tích và lời giải chi tiết.
* **Luồng thay thế / Ngoại lệ (Alternative Flows):**
  * *4a. Sự cố mất mạng hoặc vô tình đóng trình duyệt:* Thí sinh mở lại trang thi $\rightarrow$ Hệ thống khôi phục trạng thái làm bài từ `localStorage` và Redis Cache $\rightarrow$ Tiếp tục làm bài với thời gian còn lại.
  * *6a. Thí sinh quên nộp bài khi hết giờ:* Đồng hồ đếm ngược về 0 $\rightarrow$ Hệ thống tự động khóa chọn đáp án và kích hoạt luồng tự động nộp bài thay thí sinh.

---

### Ca Sử Dụng 2: `UC-ADMIN-02` - Import Ngân Hàng Câu Hỏi Từ File Excel

* **Mã ca sử dụng:** `UC-ADMIN-02`
* **Tên ca sử dụng:** Nhập câu hỏi hàng loạt từ file bảng tính Excel
* **Tác nhân chính:** Giảng viên (`MOD`) hoặc Quản trị viên (`ADMIN`)
* **Tiền điều kiện:** Người dùng có quyền `CREATE` trên môn học chỉ định.
* **Hậu điều kiện:** Hàng trăm câu hỏi và đáp án được thêm vào cơ sở dữ liệu theo Database Transaction, đồng bộ tổng số câu hỏi của môn.
* **Luồng sự kiện chính:**
  1. Người dùng chọn Khối ngành $\rightarrow$ Môn học $\rightarrow$ Chương mục tiêu.
  2. Người dùng tải file Excel `.xlsx` chứa danh sách câu hỏi lên hệ thống.
  3. Client gửi `POST /api/v1/admin/questions/import/preview`.
  4. Server dùng Apache POI đọc từng dòng, validate tính hợp lệ: Tiêu đề, các cột lựa chọn A/B/C/D, độ khó và vị trí đáp án đúng.
  5. Server trả về kết quả kiểm tra xem trước: Số dòng hợp lệ, dữ liệu xem trước.
  6. Người dùng kiểm tra bảng xem trước và bấm nút *"Xác nhận Import"*.
  7. Client gửi `POST /api/v1/admin/questions/import`.
  8. Server mở Transaction, Batch Insert toàn bộ câu hỏi và các đáp án vào MySQL.
  9. Ghi nhật ký vào `AuditLog` và cập nhật số lượng câu hỏi trên giao diện.
* **Luồng ngoại lệ (Exception Flow):**
  * *4a. File Excel có dòng sai định dạng:* Server phát hiện dòng thiếu đáp án đúng hoặc sai cột $\rightarrow$ Trả về danh sách chi tiết các dòng vi phạm $\rightarrow$ Client hiển thị bảng lỗi để người dùng sửa lại file trước khi nạp lại.

---

### Ca Sử Dụng 3: `UC-AI-03` - Trợ Lý AI Phân Tích Chuyên Sâu Kết Quả Bài Thi

* **Mã ca sử dụng:** `UC-AI-03`
* **Tên ca sử dụng:** Phân tích năng lực bài thi bằng mô hình ngôn ngữ lớn (Gemini LLM)
* **Tác nhân chính:** Sinh viên (Thí sinh), Google Gemini API
* **Tiền điều kiện:** Thí sinh đã hoàn thành và nộp bài thi thành công.
* **Hậu điều kiện:** Sinh viên nhận được bản phân tích sư phạm chi tiết về ưu điểm, điểm yếu và gợi ý học tập.
* **Luồng sự kiện chính:**
  1. Tại trang kết quả thi, sinh viên bấm nút *"Yêu cầu AI Phân tích bài thi"*.
  2. Client gửi `POST /api/v1/ai/analyze-exam-result` kèm `userExamId`.
  3. Server tổng hợp thông tin bài thi: Điểm số, tỷ lệ đúng/sai theo từng chương và theo mức độ khó (Dễ / Trung bình / Khó).
  4. Server xây dựng System Prompt sư phạm và gửi yêu cầu tới Google Gemini 2.0 Flash API theo định dạng JSON Schema.
  5. Gemini phản hồi nội dung phân tích chi tiết.
  6. Server parse dữ liệu sang `ExamAnalysisResponse` và trả về `HTTP 200`.
  7. Client render thẻ trực quan `ExamAiAnalysisCard` gồm: Đánh giá tổng quan, phân tích điểm yếu cốt lõi và lộ trình hành động khắc phục.
