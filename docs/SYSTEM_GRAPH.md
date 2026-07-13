# System graph Quiz VNUA

Tai lieu nay mo ta lien ket giua BE, FE, security, data va cac flow chinh theo code hien tai.

## 1. Deployment overview

```mermaid
flowchart LR
    User["Nguoi dung"] --> Client["client React\nport 3000 local"]
    AdminUser["ADMIN / MOD"] --> Admin["admin React\nport 3001 local"]

    subgraph Compose["Docker Compose / Production"]
        Nginx["nginx\n80 / 443"]
        Backend["server Spring Boot\n:8080"]
        MySQL[("MySQL 8\nquiz")]
    end

    subgraph External["External services"]
        Google["Google ID Token verifier"]
        Gmail["SMTP Gmail\nverify email / OTP"]
        Cloudinary["Cloudinary optional"]
        LocalUploads["Local uploads\navatars / questions"]
    end

    Client -->|"Axios withCredentials\n/api/v1"| Nginx
    Admin -->|"Axios withCredentials\n/api/v1"| Nginx
    Nginx --> Backend
    Backend -->|"Spring Data JPA"| MySQL
    Backend --> Google
    Backend --> Gmail
    Backend --> Cloudinary
    Backend --> LocalUploads
```

## 2. Frontend to backend map

```mermaid
flowchart TB
    subgraph FE["Frontend apps"]
        ClientPages["client pages\nHome, Subject, Exam, Result, Rank, Account, Notifications"]
        AdminPages["admin pages\nHome, User, Category, Subject, Chapter, Question, Exam, Notification"]
        Axios["axiosConfig\npublicAxios / authAxios\nwithCredentials + refresh interceptor"]
    end

    subgraph Security["Spring Security"]
        Cors["CORS allowed origins"]
        Csrf["CSRF optional\nCookieCsrfTokenRepository"]
        Jwt["JwtAuthenticationFilter"]
        Rules["Route rules\npublic / admin / mod / user / authenticated"]
        Method["Method security\n@PreAuthorize + CustomPermissionEvaluator"]
    end

    subgraph Controllers["Controllers"]
        Auth["AuthController\n/api/v1/auth/*"]
        Otp["OtpController\n/api/v1/otp/*"]
        Public["Public resources\n/api/v1/public/*"]
        User["User APIs\nusers, favorites, user-exams, attempts, avatar, notifications"]
        AdminCtl["Admin APIs\nadmin/users, categories, subjects, chapters, questions, exams, notifications, permissions, statistics"]
    end

    subgraph Services["Services"]
        AuthSvc["AuthService\nEmailVerificationService\nGoogle verifier"]
        UserSvc["UserService\nAuthorizationService"]
        QuizSvc["Category/Subject/Chapter/Question/Exam services"]
        AttemptSvc["UserExamService"]
        NotifySvc["NotificationService"]
        MediaSvc["AvatarStorageService\nImageStorage"]
        StatsSvc["StatisticsService"]
    end

    Repos["Spring Data repositories"] --> DB[("MySQL quiz")]

    ClientPages --> Axios
    AdminPages --> Axios
    Axios --> Cors --> Csrf --> Jwt --> Rules --> Method
    Method --> Auth
    Method --> Otp
    Method --> Public
    Method --> User
    Method --> AdminCtl
    Auth --> AuthSvc
    Otp --> AuthSvc
    User --> UserSvc
    User --> AttemptSvc
    User --> NotifySvc
    User --> MediaSvc
    Public --> QuizSvc
    Public --> AttemptSvc
    AdminCtl --> UserSvc
    AdminCtl --> QuizSvc
    AdminCtl --> AttemptSvc
    AdminCtl --> NotifySvc
    AdminCtl --> StatsSvc
    AuthSvc --> Repos
    UserSvc --> Repos
    QuizSvc --> Repos
    AttemptSvc --> Repos
    NotifySvc --> Repos
    MediaSvc --> Repos
    StatsSvc --> Repos
```

## 3. Security route graph

```mermaid
flowchart LR
    Anonymous["Anonymous"] --> Public["Permit all\n/auth/login\n/auth/register\n/auth/google\n/auth/verify-email\n/auth/refresh\n/otp/**\n/public/**\n/swagger-ui/**\n/v3/api-docs/**\n/avatars/**\n/questions/**"]
    Authenticated["Authenticated"] --> AnyOther["anyRequest().authenticated()"]
    User["ROLE_USER"] --> UserScoped["Self routes\n/users/{id}\n/user/{id}\n/user/subjects\n/favorites\n/user-exams\n/exam-attempts\n/notifications\n/users/me/avatar"]
    Mod["ROLE_MOD"] --> AdminBase["/admin/** base access"]
    Admin["ROLE_ADMIN"] --> AdminBase
    AdminBase --> MethodChecks["@PreAuthorize\nhasRole / hasPermission"]
    MethodChecks --> SubjectPerm["UserSubjectPermission\nREAD/CREATE/UPDATE/DELETE per subject"]
```

## 4. API group graph

```mermaid
flowchart TB
    API["/api/v1"]
    API --> Auth["/auth\nlogin, me, refresh, logout, register, verify-email, google"]
    API --> Otp["/otp\nsend, verify, reset"]
    API --> Public["/public\ncategories, subjects, chapters, questions, exams, user-exam-summaries"]
    API --> Users["/users, /user\nprofile, password, avatar, user subjects"]
    API --> Favorites["/favorites\ncreate/delete\n/users/{id}/favorites"]
    API --> Attempts["/user-exams\n/exam-attempts\nhistory, autosave, progress, submit"]
    API --> Notif["/notifications\nmark read, mark all read"]
    API --> Admin["/admin\nusers, categories, subjects, chapters, questions, exams, user-exams, notifications, permissions, statistics"]
```

## 5. ERD rut gon

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
        boolean emailVerified
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
        string imageUrl
        boolean deleted
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
        string status
        int remainingSeconds
        int currentQuestionIndex
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
        UUID token
        datetime expiryDate
        UUID user_id FK
    }

    EMAIL_VERIFICATION_TOKEN {
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
        boolean isRead
        UUID user_id FK
        long history_id FK
        long relatedId
        string relatedType
    }

    GLOBAL_NOTIFICATION_READ {
        long id PK
        UUID user_id FK
        long notification_id FK
    }

    USER_SUBJECT_PERMISSION {
        long id PK
        UUID user_id FK
        long subject_id FK
        string permission
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
    USER ||--o{ EMAIL_VERIFICATION_TOKEN : verifies
    USER ||--o{ OTP_CODE : owns
    NOTIFICATION_HISTORY ||--o{ NOTIFICATION : groups
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ GLOBAL_NOTIFICATION_READ : reads
    USER ||--o{ USER_SUBJECT_PERMISSION : gets
    SUBJECT ||--o{ USER_SUBJECT_PERMISSION : scoped_to
```

## 6. Login, cookie va refresh token

```mermaid
sequenceDiagram
    actor U as User/Admin
    participant FE as React app
    participant Auth as AuthController
    participant DB as MySQL
    participant JWT as JwtAuthenticationFilter

    U->>FE: Nhap username/password
    FE->>Auth: POST /api/v1/auth/login
    Auth->>DB: Kiem tra user + password
    DB-->>Auth: UserDetails + role
    Auth-->>FE: Set-Cookie accessToken + refreshToken, body AuthResponse
    FE->>JWT: Goi API voi cookie
    JWT->>JWT: Validate access token
    JWT-->>FE: Response
    FE->>Auth: POST /api/v1/auth/refresh khi token het han
    Auth->>DB: Kiem tra refresh token UUID
    Auth-->>FE: Set-Cookie accessToken moi
```

## 7. Register va verify email

```mermaid
sequenceDiagram
    actor U as User
    participant FE as client React
    participant Auth as AuthController
    participant Mail as Gmail SMTP
    participant DB as MySQL

    U->>FE: Dang ky tai khoan
    FE->>Auth: POST /api/v1/auth/register
    Auth->>DB: Tao hoac cap nhat pending user
    Auth->>Mail: Gui verification link
    Mail-->>U: Email chua token
    U->>FE: Mo link verify
    FE->>Auth: GET /api/v1/auth/verify-email?token=...
    Auth->>DB: Danh dau emailVerified=true
    Auth-->>FE: Verify thanh cong
```

## 8. Google login

```mermaid
sequenceDiagram
    actor U as User
    participant FE as React app
    participant Google as Google
    participant Auth as AuthController
    participant DB as MySQL

    U->>FE: Dang nhap bang Google
    FE->>Google: Lay Google ID token
    Google-->>FE: idToken
    FE->>Auth: POST /api/v1/auth/google
    Auth->>Google: Verify idToken, extract email/name/picture
    Auth->>DB: Find or create Google user
    Auth-->>FE: Set-Cookie access/refresh + AuthResponse
```

## 9. Quen mat khau bang OTP

```mermaid
sequenceDiagram
    actor U as User
    participant FE as React app
    participant OTP as OtpController
    participant Mail as Gmail SMTP
    participant DB as MySQL

    U->>FE: Nhap email quen mat khau
    FE->>OTP: POST /api/v1/otp/send
    OTP->>DB: Tao OTP
    OTP->>Mail: Gui OTP
    Mail-->>U: Ma OTP
    U->>FE: Nhap OTP
    FE->>OTP: POST /api/v1/otp/verify
    OTP->>DB: Kiem tra OTP
    OTP-->>FE: resetToken
    FE->>OTP: POST /api/v1/otp/reset
    OTP->>DB: Hash va cap nhat mat khau
```

## 10. On tap theo subject/chapter

```mermaid
sequenceDiagram
    actor U as User
    participant C as client React
    participant API as Public APIs
    participant DB as MySQL

    U->>C: Mo man hinh on tap
    C->>API: GET /api/v1/public/subjects
    API->>DB: Doc subject
    DB-->>API: Subjects
    API-->>C: Subjects
    C->>API: GET /api/v1/public/chapters/subject/{subjectId}
    API->>DB: Doc chapter
    DB-->>API: Chapters
    API-->>C: Chapters
    C->>API: GET /api/v1/public/questions/chapter/{chapterId}?includeCorrectAnswers=false
    API->>DB: Doc questions + answers
    API->>API: Strip isCorrect neu khong duoc phep xem
    API-->>C: Questions
```

## 11. Lam bai thi va autosave

```mermaid
sequenceDiagram
    actor U as User
    participant C as client React
    participant API as Exam/UserExam APIs
    participant DB as MySQL

    U->>C: Chon de thi
    C->>API: GET /api/v1/public/exams/subject/{subjectId}
    API-->>C: Danh sach exam
    C->>API: GET /api/v1/public/exams/{examId}?includeCorrectAnswers=false
    API-->>C: Noi dung exam khong lo dap an dung
    C->>API: POST /api/v1/exam-attempts/start
    API->>DB: Tao hoac resume UserExam status IN_PROGRESS
    API-->>C: ExamAttemptResponse
    U->>C: Chon dap an
    C->>API: PUT /api/v1/exam-attempts/{userExamId}/answers
    API->>DB: Luu UserAnswer
    C->>API: PATCH /api/v1/exam-attempts/{userExamId}/progress
    API->>DB: Luu currentQuestionIndex/remainingSeconds
    U->>C: Nop bai
    C->>API: POST /api/v1/exam-attempts/{userExamId}/submit
    API->>DB: Tinh diem, set SUBMITTED
    API-->>C: UserExamDto
    C->>API: GET /api/v1/public/exams/{examId}?includeCorrectAnswers=true&userExamId={userExamId}
    API-->>C: Exam co dap an dung neu attempt da SUBMITTED
```

## 12. Quan tri noi dung quiz

```mermaid
sequenceDiagram
    actor A as ADMIN/MOD
    participant FE as admin React
    participant API as Admin controllers
    participant Perm as CustomPermissionEvaluator
    participant DB as MySQL

    A->>FE: Tao/sua/xoa subject, chapter, question, exam
    FE->>API: /api/v1/admin/*
    API->>Perm: Kiem tra role va permission theo subject/chapter/question/exam
    Perm->>DB: Doc UserSubjectPermission khi can
    DB-->>Perm: Permission set
    Perm-->>API: Allow/Deny
    API->>DB: Luu thay doi
    API-->>FE: ApiResponse hoac 204
```

## 13. Import cau hoi tu Excel

```mermaid
sequenceDiagram
    actor A as ADMIN/MOD
    participant FE as admin React
    participant API as QuestionController
    participant Excel as ExcelHelper / QuestionImportService
    participant DB as MySQL

    A->>FE: Chon file import
    FE->>API: POST /api/v1/admin/questions/import multipart(file, categoryId, subjectId, chapterId)
    API->>Excel: Parse workbook
    Excel-->>API: QuestionDto + AnswerDto
    API->>DB: Luu Question va Answer
    API-->>FE: Import thanh cong hoac loi dong du lieu
```

## 14. Favorite subject

```mermaid
sequenceDiagram
    actor U as User
    participant C as client React
    participant API as FavoriteController
    participant DB as MySQL

    U->>C: Them subject vao yeu thich
    C->>API: POST /api/v1/favorites
    API->>DB: Tao Favorite(userId, subjectId)
    API-->>C: FavoriteDto
    U->>C: Xoa subject khoi yeu thich
    C->>API: DELETE /api/v1/favorites
    API->>DB: Xoa Favorite
    C->>API: GET /api/v1/users/{userId}/favorites
    API-->>C: Danh sach favorite
```

## 15. Notification

```mermaid
sequenceDiagram
    actor A as ADMIN/MOD
    actor U as User
    participant AdminFE as admin React
    participant ClientFE as client React
    participant API as Notification APIs
    participant DB as MySQL

    A->>AdminFE: Tao campaign thong bao
    AdminFE->>API: POST /api/v1/admin/notifications/global|personal|subject|batch
    API->>DB: Luu NotificationHistory va Notification
    API-->>AdminFE: Gui thanh cong
    AdminFE->>API: GET /api/v1/admin/notifications/campaigns
    API-->>AdminFE: Page CampaignResponse
    AdminFE->>API: GET /api/v1/admin/notifications/history/{id}/recipients
    API-->>AdminFE: Page RecipientResponse
    U->>ClientFE: Doc thong bao
    ClientFE->>API: PATCH /api/v1/notifications/{id}
    API->>DB: Mark one as read
    ClientFE->>API: PATCH /api/v1/notifications
    API->>DB: Mark all as read
```

Note: code hien tai cua `NotificationController` chua expose endpoint lay danh sach notification cho user, chi co mark read va mark all read.

## 16. Avatar va anh cau hoi

```mermaid
sequenceDiagram
    actor U as User
    actor A as ADMIN
    participant FE as React app
    participant API as Avatar/Question controller
    participant Storage as Local or Cloudinary
    participant DB as MySQL

    U->>FE: Chon avatar
    FE->>API: PUT /api/v1/users/me/avatar multipart(file)
    API->>Storage: Luu file
    API->>DB: Cap nhat User.avatarUrl
    API-->>FE: avatarUrl, imgPath
    A->>FE: Upload anh minh hoa question
    FE->>API: POST /api/v1/admin/questions/upload-image multipart(file)
    API->>Storage: Luu file
    API-->>FE: imageUrl
```

## 17. Gan quyen MOD theo subject

```mermaid
sequenceDiagram
    actor A as ADMIN
    participant FE as admin React
    participant API as AdminPermissionController
    participant Perm as CustomPermissionEvaluator
    participant DB as MySQL

    A->>FE: Chon user MOD, subject va permissions
    FE->>API: POST /api/v1/admin/permissions/subject-assignment
    API->>DB: Luu UserSubjectPermission
    API-->>FE: Permissions assigned
    FE->>API: PATCH /api/v1/admin/permissions/user/{userId}/role
    API->>DB: Cap nhat role USER/MOD/ADMIN
    FE->>API: GET /api/v1/admin/permissions/mod/{userId}
    API-->>FE: Map subjectId -> permissions
    FE->>API: MOD thao tac subject/question/exam
    API->>Perm: hasPermission(...)
    Perm->>DB: Kiem tra permission
    Perm-->>API: Allow/Deny
```
