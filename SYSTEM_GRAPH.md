# Graph tuong quan he thong Quiz

Tai lieu nay tom tat cac quan he chinh cua project theo 3 lop: trien khai, ung dung/API, va du lieu nghiep vu.

## 1. Kien truc tong quan

```mermaid
flowchart LR
    User["Nguoi dung"]
    AdminUser["Quan tri vien / Moderator"]

    subgraph Browser["Trinh duyet"]
        Client["client React\nCong nguoi dung"]
        Admin["admin React\nCong quan tri"]
    end

    subgraph Deploy["Docker Compose / Production"]
        Nginx["nginx\n80 / 443"]
        Backend["server Spring Boot\nAPI :8080"]
        MySQL[("MySQL 8.0\nquiz")]
    end

    subgraph External["Dich vu ngoai"]
        GoogleOAuth["Google OAuth2"]
        GoogleDrive["Google Drive\nAvatar storage"]
        Gmail["SMTP Gmail\nOTP / Email"]
    end

    User --> Client
    AdminUser --> Admin
    Client -->|"HTTP API / cookies"| Nginx
    Admin -->|"HTTP API / cookies"| Nginx
    Nginx --> Backend
    Backend -->|"JPA repositories"| MySQL
    Backend -->|"xac thuc Google"| GoogleOAuth
    Backend -->|"upload avatar"| GoogleDrive
    Backend -->|"gui OTP / email"| Gmail
```

## 2. Quan he giua frontend, API va service backend

```mermaid
flowchart TB
    subgraph Frontend["Frontend"]
        ClientPages["client pages\nLogin, Home, Exam, Revision, Rank, Account, Notifications"]
        AdminPages["admin pages\nUser, Subject, Chapter, Question, Exam, Notification, Statistics"]
        Axios["axiosConfig\npublicAxios / authAxios\nwithCredentials + refresh token"]
    end

    subgraph Security["Spring Security"]
        Cors["CORS allowed origins"]
        JwtFilter["JwtAuthenticationFilter"]
        RouteGuard["Route rules\npublic / user / admin"]
        Permission["CustomPermissionEvaluator\nsubject permissions"]
    end

    subgraph Controllers["REST Controllers"]
        AuthCtl["AuthController\n/api/v1/auth"]
        OtpCtl["OtpController\n/api/v1/otp"]
        PublicCtl["Public APIs\nsubjects, categories, chapters, questions, exams, summaries"]
        UserCtl["User APIs\nprofile, password, user exams, favorites, notifications, avatar"]
        AdminCtl["Admin APIs\nusers, subjects, chapters, questions, exams, permissions, statistics, notifications"]
        OAuthCtl["OAuth2LoginController\n/api/v2/auth/google"]
    end

    subgraph Services["Services"]
        AuthSvc["AuthService"]
        OtpSvc["OtpService / EmailService"]
        QuizSvc["Category / Subject / Chapter / Question / Exam services"]
        UserExamSvc["UserExamService"]
        NotifySvc["NotificationService"]
        AvatarSvc["AvatarStorageService / GDriveAvatarService"]
        StatsSvc["StatisticsService"]
    end

    subgraph Persistence["Persistence"]
        Repos["Spring Data repositories"]
        DB[("MySQL quiz")]
    end

    ClientPages --> Axios
    AdminPages --> Axios
    Axios --> Cors
    Cors --> JwtFilter
    JwtFilter --> RouteGuard
    RouteGuard --> AuthCtl
    RouteGuard --> OtpCtl
    RouteGuard --> PublicCtl
    RouteGuard --> UserCtl
    RouteGuard --> AdminCtl
    RouteGuard --> OAuthCtl
    AdminCtl --> Permission

    AuthCtl --> AuthSvc
    OtpCtl --> OtpSvc
    PublicCtl --> QuizSvc
    UserCtl --> QuizSvc
    UserCtl --> UserExamSvc
    UserCtl --> NotifySvc
    UserCtl --> AvatarSvc
    AdminCtl --> QuizSvc
    AdminCtl --> StatsSvc
    AdminCtl --> NotifySvc
    OAuthCtl --> AuthSvc

    AuthSvc --> Repos
    OtpSvc --> Repos
    QuizSvc --> Repos
    UserExamSvc --> Repos
    NotifySvc --> Repos
    AvatarSvc --> Repos
    StatsSvc --> Repos
    Repos --> DB
```

## 3. Phan quyen API

```mermaid
flowchart LR
    Anonymous["Chua dang nhap"] --> Public["/api/v1/public/**\n/api/v1/auth/**\n/api/v1/otp/**\n/swagger-ui/**\n/avatars/**"]
    User["ROLE_USER"] --> UserAPI["/api/v1/user/**"]
    Mod["ROLE_MOD"] --> UserAPI
    Mod --> AdminAPI["/api/v1/admin/**\n/api/v1/mod/**"]
    Admin["ROLE_ADMIN"] --> UserAPI
    Admin --> AdminAPI
```

## 4. ERD rut gon

```mermaid
erDiagram
    USER {
        UUID userId PK
        string username
        string email
        string fullName
        string role
        string authProvider
        string avatarUrl
    }

    CATEGORY {
        long categoryId PK
        string name
        string description
    }

    SUBJECT {
        long subjectId PK
        string name
        string description
        long category_id FK
    }

    CHAPTER {
        long chapterId PK
        int chapterNumber
        string name
        long subject_id FK
    }

    QUESTION {
        long questionId PK
        string content
        string difficulty
        long chapter_id FK
    }

    ANSWER {
        long optionId PK
        string content
        boolean isCorrect
        long question_id FK
    }

    EXAM {
        long examId PK
        string title
        string description
        int duration
        date createdTime
        long subject_id FK
        UUID created_by FK
    }

    EXAM_QUESTION {
        long exam_id PK,FK
        long question_id PK,FK
    }

    USER_EXAM {
        long userExamId PK
        datetime startTime
        datetime endTime
        float score
        UUID user_id FK
        long exam_id FK
    }

    USER_ANSWER {
        long userAnswerId PK
        long user_exam_id FK
        long question_id FK
        long option_id FK
    }

    FAVORITE {
        UUID user_id PK,FK
        long subject_id PK,FK
    }

    REFRESH_TOKEN {
        long id PK
        string token
        datetime expiryDate
        UUID user_id FK
    }

    OTP_CODE {
        long id PK
        string code
        datetime expiryTime
        UUID user_id FK
    }

    NOTIFICATION_HISTORY {
        long id PK
        string title
        string message
        datetime createdAt
    }

    NOTIFICATION {
        long id PK
        string title
        string message
        string type
        UUID user_id
        boolean isRead
        long history_id FK
        long relatedId
        string relatedType
    }

    GLOBAL_NOTIFICATION_READ {
        long id PK
        UUID user_id
        long notification_id
    }

    USER_SUBJECT_PERMISSION {
        long id PK
        UUID user_id
        long subject_id
    }

    CATEGORY ||--o{ SUBJECT : contains
    SUBJECT ||--o{ CHAPTER : contains
    SUBJECT ||--o{ EXAM : has
    CHAPTER ||--o{ QUESTION : contains
    QUESTION ||--o{ ANSWER : has
    EXAM ||--o{ EXAM_QUESTION : includes
    QUESTION ||--o{ EXAM_QUESTION : selected_for
    USER ||--o{ EXAM : creates
    USER ||--o{ USER_EXAM : takes
    EXAM ||--o{ USER_EXAM : attempts
    USER_EXAM ||--o{ USER_ANSWER : records
    QUESTION ||--o{ USER_ANSWER : answered
    ANSWER ||--o{ USER_ANSWER : chosen
    USER ||--o{ FAVORITE : marks
    SUBJECT ||--o{ FAVORITE : favorited
    USER ||--o{ REFRESH_TOKEN : owns
    USER ||--|| OTP_CODE : has
    NOTIFICATION_HISTORY ||--o{ NOTIFICATION : groups
```

## 5. Luong lam bai thi

```mermaid
sequenceDiagram
    actor U as User
    participant C as client React
    participant API as Spring Boot API
    participant DB as MySQL

    U->>C: Chon mon hoc / de thi
    C->>API: GET /api/v1/public/exams/subject/{subjectId}
    API->>DB: Doc Subject, Exam
    DB-->>API: Danh sach de thi
    API-->>C: Tra ve de thi
    C->>API: GET /api/v1/public/exams/{examId}
    API->>DB: Doc Exam, ExamQuestion, Question, Answer
    DB-->>API: Noi dung bai thi
    API-->>C: Cau hoi va dap an
    U->>C: Nop bai
    C->>API: POST /api/v1/user/userexams
    API->>DB: Luu UserExam va UserAnswer
    API->>DB: Tinh diem / doc dap an dung
    DB-->>API: Ket qua
    API-->>C: Diem va tong ket
```

## 6. Luong dang nhap va refresh token

```mermaid
sequenceDiagram
    actor U as User/Admin
    participant FE as React app
    participant API as Auth API
    participant JWT as JWT filter
    participant DB as MySQL

    U->>FE: Dang nhap
    FE->>API: POST /api/v1/auth/login
    API->>DB: Kiem tra user + password
    DB-->>API: User va role
    API-->>FE: Access token / refresh token cookie
    FE->>JWT: Goi API bang authAxios
    JWT->>JWT: Kiem tra JWT va role
    JWT-->>FE: Response thanh cong
    FE->>API: POST /api/v1/auth/refresh khi 401/403
    API->>DB: Kiem tra refresh token
    API-->>FE: Cap access token moi
```

## 7. Luong quan tri danh muc, mon hoc, chuong

```mermaid
sequenceDiagram
    actor A as Admin/MOD
    participant FE as admin React
    participant API as Admin APIs
    participant SEC as Spring Security
    participant DB as MySQL

    A->>FE: Tao/sua/xoa category, subject, chapter
    FE->>API: POST/PUT/DELETE /api/v1/admin/categories|subjects|chapters
    API->>SEC: Kiem tra ROLE_ADMIN/ROLE_MOD
    SEC->>SEC: Kiem tra quyen mon hoc neu can
    API->>DB: Luu Category, Subject, Chapter
    DB-->>API: Du lieu da cap nhat
    API-->>FE: Ket qua thao tac
```

## 8. Luong import cau hoi tu Excel

```mermaid
sequenceDiagram
    actor A as Admin/MOD
    participant FE as admin React
    participant API as QuestionController
    participant Excel as ExcelHelper
    participant DB as MySQL

    A->>FE: Chon file mau_import.xlsx
    FE->>API: POST /api/v1/admin/questions/import
    API->>Excel: Doc file va parse cau hoi/dap an
    Excel-->>API: Danh sach QuestionDto
    API->>DB: Luu Question va Answer theo Chapter
    DB-->>API: Import thanh cong / loi dong du lieu
    API-->>FE: Thong bao ket qua import
```

## 9. Luong on tap theo mon hoc va chuong

```mermaid
sequenceDiagram
    actor U as User
    participant C as client React
    participant API as Public APIs
    participant DB as MySQL

    U->>C: Mo trang on tap
    C->>API: GET /api/v1/public/subjects
    API->>DB: Doc danh sach mon hoc
    DB-->>API: Subjects
    API-->>C: Subjects
    C->>API: GET /api/v1/public/chapters/subject/{subjectId}
    API->>DB: Doc chuong theo mon
    DB-->>API: Chapters
    API-->>C: Chapters
    C->>API: GET /api/v1/public/questions/chapter/{chapterId}
    API->>DB: Doc cau hoi va dap an
    DB-->>API: Questions
    API-->>C: Noi dung on tap
```

## 10. Luong yeu thich mon hoc

```mermaid
sequenceDiagram
    actor U as User
    participant C as client React
    participant API as FavoriteController
    participant DB as MySQL

    U->>C: Them/xoa mon hoc yeu thich
    C->>API: POST/DELETE /api/v1/user/favorites
    API->>DB: Tao/xoa Favorite(user_id, subject_id)
    DB-->>API: Trang thai moi
    API-->>C: Cap nhat danh sach yeu thich
    C->>API: GET /api/v1/user/favorites/user/{userId}
    API->>DB: Doc Favorite theo user
    API-->>C: Danh sach mon hoc yeu thich
```

## 11. Luong thong bao

```mermaid
sequenceDiagram
    actor A as Admin/MOD
    actor U as User
    participant AdminFE as admin React
    participant ClientFE as client React
    participant API as Notification APIs
    participant DB as MySQL

    A->>AdminFE: Tao thong bao global/personal/subject/batch
    AdminFE->>API: POST /api/v1/admin/notifications/*
    API->>DB: Luu NotificationHistory va Notification
    DB-->>API: Campaign da tao
    API-->>AdminFE: Ket qua gui
    U->>ClientFE: Mo danh sach thong bao
    ClientFE->>API: GET /api/v1/notifications
    API->>DB: Doc thong bao ca nhan/global
    DB-->>API: Notifications
    API-->>ClientFE: Danh sach thong bao
    U->>ClientFE: Danh dau da doc
    ClientFE->>API: PUT /api/v1/notifications/{id}/read
    API->>DB: Cap nhat isRead hoac GlobalNotificationRead
```

## 12. Luong quen mat khau bang OTP

```mermaid
sequenceDiagram
    actor U as User
    participant FE as React app
    participant OTP as OtpController
    participant Mail as Gmail SMTP
    participant DB as MySQL

    U->>FE: Nhap email quen mat khau
    FE->>OTP: POST /api/v1/otp/send
    OTP->>DB: Tao OtpCode cho user
    OTP->>Mail: Gui ma OTP
    Mail-->>U: Email OTP
    U->>FE: Nhap OTP va mat khau moi
    FE->>OTP: POST /api/v1/otp/verify
    OTP->>DB: Kiem tra OTP con han
    FE->>OTP: POST /api/v1/otp/reset
    OTP->>DB: Cap nhat mat khau da hash
    OTP-->>FE: Reset thanh cong
```

## 13. Luong dang nhap Google

```mermaid
sequenceDiagram
    actor U as User
    participant FE as React app
    participant Google as Google OAuth2
    participant API as OAuth2LoginController
    participant DB as MySQL

    U->>FE: Dang nhap bang Google
    FE->>Google: Lay Google ID token
    Google-->>FE: ID token
    FE->>API: POST /api/v2/auth/google
    API->>Google: Verify ID token
    Google-->>API: Thong tin tai khoan
    API->>DB: Tao hoac cap nhat User authProvider=GOOGLE
    API-->>FE: Token/cookie dang nhap
```

## 14. Luong cap nhat avatar

```mermaid
sequenceDiagram
    actor U as User
    participant FE as React app
    participant API as AvatarController
    participant Drive as Google Drive
    participant FS as Local uploads
    participant DB as MySQL

    U->>FE: Chon anh dai dien
    FE->>API: POST /api/v1/users/me/avatar/{userId}
    API->>Drive: Upload avatar neu cau hinh GDrive
    API->>FS: Hoac luu vao uploads/avatars
    API->>DB: Cap nhat User.avatarUrl
    API-->>FE: URL avatar moi
```

## 15. Luong thong ke admin

```mermaid
sequenceDiagram
    actor A as Admin/MOD
    participant FE as admin React
    participant API as StatisticsController
    participant DB as MySQL

    A->>FE: Mo dashboard
    FE->>API: GET /api/v1/admin/statistics
    API->>DB: Tong hop users, exams, questions, attempts, scores
    DB-->>API: So lieu thong ke
    API-->>FE: Du lieu bieu do va tong quan
```

## 16. Luong gan quyen MOD theo mon hoc

```mermaid
sequenceDiagram
    actor A as Admin
    participant FE as admin React
    participant API as AdminPermissionController
    participant PERM as CustomPermissionEvaluator
    participant DB as MySQL

    A->>FE: Gan MOD quan ly mon hoc
    FE->>API: POST /api/v1/admin/permissions/subject-assignment
    API->>DB: Luu UserSubjectPermission(user_id, subject_id)
    API-->>FE: Gan quyen thanh cong
    FE->>API: MOD thao tac cau hoi/de thi cua mon hoc
    API->>PERM: Kiem tra quyen tren subject
    PERM->>DB: Doc UserSubjectPermission
    DB-->>PERM: Co/khong co quyen
    PERM-->>API: Cho phep hoac tu choi
```
