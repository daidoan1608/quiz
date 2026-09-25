# Huong Dan CI/CD & Quan Ly Secret (Quiz System)

Tai lieu nay mo ta kien truc pipeline CI/CD tu dong cua he thong Quiz, co che quan ly Secret tap trung va cac buoc thiet lap GitHub Actions.

---

## 1. Tong quan kien truc CI/CD

Quy trinh phat trien va trien khai tu dong gom 2 giai doan:

```
[ Developer ]
      |
      | (git push / PR to production)
      v
+--------------------------------------------------------------+
| 1. CI Pipeline (.github/workflows/ci.yml)                    |
| - Backend: Compile, Chay Unit/Integration Test, Build JAR    |
| - Frontend Client: Type-check, Build Vite Bundle             |
| - Frontend Admin: Type-check, Build Vite Bundle              |
| - Docker: Validate cu phap Compose file                      |
| - Build & Push Docker Images len GitHub Registry (ghcr.io)   |
+--------------------------------------------------------------+
      |
      | (Chi khi CI Pass 100% & Image da push thanh cong)
      v
+--------------------------------------------------------------+
| 2. CD Pipeline (.github/workflows/cd.yml)                    |
| - Doc cac Secrets tu GitHub Repository Secrets               |
| - Ket noi SSH vao VPS qua Private Key                        |
| - Pull ma nguon moi nhat tu nhanh production                 |
| - Inject toan bo bien moi truong vao server/.env.production  |
| - Kéo Docker Image tu GHCR (Zero-build tren VPS - cuc nhe)   |
| - Restart Service tren VPS chi trong 5-10 giay               |
| - Tu dong don dep Docker cache/images cu                     |
+--------------------------------------------------------------+
```

---

## 2. Co che lay bien moi truong (.env) trong CD

Vi cac file `.env` chua thong tin mat khau, API key va bi chan boi `.gitignore`, he thong ap dung mo hinh **Secret Injection tu dong qua GitHub Actions**:

1. **Khong commit `.env` vao Git**: Dam bao an toan tuyet doi cho ma nguon.
2. **Luu tru tap trung tren GitHub**: Noi dung file `.env.production` duoc luu trong mot Secret duy nhat ten la `PROD_ENV_FILE` (duoc GitHub ma hoa chuan NaCl box).
3. **Tu dong sinh file tren VPS**: Khi CD chay, GitHub Runner se truyen gia tri cua `PROD_ENV_FILE` sang VPS qua phien SSH va ghi thang vao duong dan `server/.env.production` truoc khi goi lenh `docker compose up`.

---

## 3. Danh sach GitHub Secrets can thiet

Vao repository tren GitHub: **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.

| Ten Secret | Bat buoc | Mo ta | Vi du mau |
| :--- | :--- | :--- | :--- |
| `SSH_HOST` | Co | Dia chi IP public hoac domain cua VPS | `103.123.45.67` |
| `SSH_USER` | Co | Ten tai khoan dang nhap SSH | `ubuntu` hoac `root` |
| `SSH_PRIVATE_KEY` | Co | Noi dung Private Key OpenSSH dung de xac thuc | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |
| `SSH_PORT` | Khong | Cong SSH cua VPS (mac dinh la 22) | `22` |
| `TARGET_DIR` | Khong | Thu muc chua ma nguon tren VPS (mac dinh `/opt/quiz`) | `/opt/quiz` hoac `/home/ubuntu/quiz` |
| `PROD_ENV_FILE` | Co | Toan bo noi dung cau hinh file `.env.production` | Xem mau ben duoi |

---

## 4. Mau noi dung cho Secret `PROD_ENV_FILE`

Khi tao Secret `PROD_ENV_FILE` tren GitHub, copy toan bo noi dung ben duoi va dien cac gia tri that cua Production:

```properties
SPRING_APPLICATION_NAME=quiz
SERVER_PORT=8080
JAVA_TOOL_OPTIONS="-Xms256m -Xmx768m -XX:+UseG1GC"

DB_HOST=db
DB_PORT=3306
DB_NAME=quiz
DB_USER=root
DB_PASSWORD=YOUR_STRONG_PRODUCTION_DB_PASSWORD
MYSQL_ROOT_PASSWORD=YOUR_STRONG_PRODUCTION_DB_PASSWORD
SPRING_DATASOURCE_DRIVER=com.mysql.cj.jdbc.Driver
SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/quiz?useUnicode=true&characterEncoding=utf8&connectionCollation=utf8mb4_unicode_ci&serverTimezone=Asia/Ho_Chi_Minh

# Redis Configuration
SPRING_CACHE_TYPE=redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_KEY_PREFIX=quiz

# Flyway & JPA
FLYWAY_BASELINE_ON_MIGRATE=true
FLYWAY_BASELINE_VERSION=0
SPRING_FLYWAY_ENABLED=false
JPA_SHOW_SQL=false
JPA_DDL_AUTO=validate

# JWT Security
JWT_SECRET=YOUR_AT_LEAST_32_CHARS_RANDOM_SECRET_KEY_HERE
JWT_ACCESS_TOKEN_EXPIRATION=900000
JWT_REFRESH_TOKEN_EXPIRATION=604800000

# Mail SMTP
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS_ENABLE=true

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_JWKS_URL=https://www.googleapis.com/oauth2/v3/certs

# Cloudinary
CLOUDINARY_ENABLED=false
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=quiz

# Domain & CORS
APP_FRONTEND_BASE_URL=https://quizvnua.com
APP_CORS_ALLOWED_ORIGINS=https://quizvnua.com,https://admin.quizvnua.com,https://api.quizvnua.com
APP_COOKIE_DOMAIN=quizvnua.com
APP_COOKIE_SECURE=true
APP_COOKIE_SAME_SITE=Strict
APP_COOKIE_MAX_AGE=86400
APP_SECURITY_CSRF_ENABLED=false

# Swagger Production (Nen tat tren Production de bao mat)
SWAGGER_API_DOCS_ENABLED=false
SWAGGER_UI_ENABLED=false
SWAGGER_UI_PATH=/swagger-ui
SWAGGER_API_DOCS_PATH=/v3/api-docs

# Initial Admin
ADMIN_INITIALIZER_ENABLED=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD
ADMIN_EMAIL=admin@quizvnua.com
ADMIN_FULL_NAME=System Administrator

# Frontend URLs
CLIENT_API_URL=/api/v1/
ADMIN_API_URL=/api/v1/
ADMIN_BASENAME=/

# AI Integration
AI_ENABLED=true
AI_PROVIDER=gemini
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.0-flash
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta

# RabbitMQ
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_MANAGEMENT_PORT=15672
RABBITMQ_USERNAME=prod_user
RABBITMQ_PASSWORD=YOUR_RABBITMQ_PASSWORD

# Monitoring & Grafana
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=YOUR_GRAFANA_PASSWORD
GRAFANA_APP_TITLE=Quiz VNUA - Giam Sat He Thong
GRAFANA_APP_SUB_TITLE=He thong giam sat va canh bao su co Quiz VNUA
GRAFANA_ORG_NAME=Quiz VNUA
GRAFANA_INSTANCE_NAME=Quiz VNUA Monitor
GRAFANA_PORT=3002

# Ports
CLIENT_PORT=3000
ADMIN_PORT=3001
NGINX_PORT=80
NGINX_HTTPS_PORT=443
PROMETHEUS_PORT=9090
ALERTMANAGER_PORT=9093
LOKI_PORT=3100
REDIS_EXPORTER_PORT=9121
```

---

## 5. Thiet lap VPS truoc lan dau chay CD

Tren may chu VPS (Ubuntu/Debian):

1. **Cai dat Docker va Git**:
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose-plugin git
   sudo usermod -aG docker $USER
   ```
2. **Tao thu muc va clone du an**:
   ```bash
   sudo mkdir -p /opt/quiz
   sudo chown -R $USER:$USER /opt/quiz
   git clone -b production https://github.com/daidoan1608/quiz.git /opt/quiz
   ```
3. **Tao cap SSH Key cho GitHub Actions**:
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/id_deploy -N ""
   cat ~/.ssh/id_deploy.pub >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```
   - Copy noi dung file `~/.ssh/id_deploy` (Private Key) de them vao Secret `SSH_PRIVATE_KEY` tren GitHub.

---

## 6. Kich hoat trien khai (Deploy)

- **Tu dong (Automated)**: Khi ban merge hoac push commit vao nhanh `production`, CI se chay truoc. Khi CI pass toan bo, CD se tu dong kich hoat va cap nhat len VPS.
- **Thu cong (Manual Dispatch)**: Vao tab **Actions** tren GitHub -> Chon **Quiz CD Pipeline** -> Bam **Run workflow** -> Chon nhanh `production`.
