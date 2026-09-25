# Frontend Documentation (React & Vite)

Hệ thống Quiz VNUA gồm 2 ứng dụng Frontend độc lập phát triển bằng **React 18** và bộ công cụ build siêu tốc **Vite 7**:

- **`client/`**: Ứng dụng web cho Sinh viên / Thí sinh.
- **`admin/`**: Ứng dụng web cho Quản trị viên (`ADMIN`) và Điều hành viên (`MOD`).

---

## 1. Công Nghệ Sử Dụng

| Thư viện / Công cụ | Phiên bản | Mục Đích Sử Dụng |
| :--- | :--- | :--- |
| **React** | 18.3.1 | Thư viện UI cốt lõi |
| **Vite** | 7.x | Build tool & Development server cực nhanh |
| **Ant Design (antd)** | 5.29.1 | Bộ component UI chuẩn doanh nghiệp |
| **React Router DOM** | 7.x | Điều hướng trang & bảo vệ route (Guards) |
| **Axios** | 1.13.2 | Gọi API backend kèm Interceptor tự động refresh token |
| **Recharts** | 2.15.0 | Vẽ biểu đồ thống kê kết quả thi & phân tích năng lực |
| **i18next** | 26.x | Hỗ trợ đa ngôn ngữ (Tiếng Việt / English) trong client |
| **STOMP / SockJS** | 7.3.0 | Nhận thông báo realtime qua WebSocket |
| **dnd-kit** | 6.x | Kéo thả sắp xếp câu hỏi và đáp án trong Admin |
| **html2canvas & jsPDF** | - | Xuất đề thi ra định dạng file PDF để in ấn |

---

## 2. Ứng Dụng Client (`client/`)

Địa chỉ truy cập: **`http://localhost`** (Local Nginx) hoặc `http://localhost:3000` (Dev trực tiếp).

### Các phân hệ chính:
1. **Xác thực & Tài khoản:**
   - Đăng ký, kích hoạt tài khoản qua email.
   - Đăng nhập thông thường hoặc qua Google One-tap / OAuth.
   - Quên mật khẩu qua mã OTP gửi về Email.
   - Cập nhật trang cá nhân, đổi mật khẩu và đổi avatar.
2. **Học tập & Ôn tập:**
   - Xem danh mục Khối ngành (`Category`), Môn học (`Subject`), Chương (`Chapter`).
   - Đánh dấu môn học yêu thích.
   - Ôn tập câu hỏi theo từng chương hoặc theo đề thi.
3. **Giao diện Làm Bài Thi (Exam Attempt):**
   - Đếm ngược thời gian làm bài chính xác.
   - Tự động lưu đáp án (`Autosave`) mỗi khi thí sinh chọn đáp án.
   - Danh sách câu hỏi trực quan (đánh dấu câu đã làm, câu chưa làm, câu nghi vấn).
   - Nộp bài thi và hiển thị kết quả chấm điểm kèm lời giải chi tiết.
4. **Bảng Xếp Hạng & Lịch Sử:**
   - Xem lịch sử thi, số điểm, thời gian làm bài.
   - Bảng vinh danh Top thí sinh có điểm số cao nhất theo môn học/tuần/tháng.
5. **Thông Báo:**
   - Nhận thông báo hệ thống hoặc thông báo cá nhân theo thời gian thực qua WebSocket.

---

## 3. Ứng Dụng Admin (`admin/`)

Địa chỉ truy cập: **`http://admin.localhost`** (Local Nginx) hoặc `http://localhost:3001` (Dev trực tiếp).

### Các phân hệ chính:
1. **Dashboard Thống Kê:**
   - Tổng quan số lượng người dùng, câu hỏi, đề thi, lượt thi trong ngày/tháng.
2. **Quản Lý Ngân Hàng Đề & Câu Hỏi:**
   - Thêm, sửa, xóa (soft delete & restore) câu hỏi và đáp án.
   - Soạn thảo công thức Toán học bằng định dạng LaTeX/Markdown.
   - Đính kèm hình ảnh minh họa cho câu hỏi.
   - **Import Excel:** Tải file Excel mẫu, điền câu hỏi và import hàng loạt vào hệ thống.
3. **Quản Lý Đề Thi:**
   - Tạo đề thi cố định hoặc cấu hình ma trận sinh đề thi tự động.
   - Xem trước đề thi (`Preview`) và xuất file PDF đề thi phục vụ in trên giấy.
4. **Quản Lý Thông Báo (Campaigns):**
   - Tạo chiến dịch thông báo toàn hệ thống (Global), thông báo theo môn học hoặc gửi riêng cho danh sách sinh viên chỉ định.
   - Theo dõi tỷ lệ đọc thông báo và thu hồi thông báo khi cần.
5. **Phân Quyền & Audit Log:**
   - Tạo nhóm quản trị (`AdminGroup`), phân quyền chi tiết theo từng menu chức năng cho các tài khoản `MOD`.
   - Xem nhật ký hoạt động (`Audit Logs`) của các quản trị viên.

---

## 4. Biến Môi Trường (Environment Variables)

Các biến cấu hình bắt đầu bằng tiền tố `VITE_`:

```env
# URL trỏ đến Backend API
VITE_API_URL=/api/v1/

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Đường dẫn base cho admin
VITE_ADMIN_BASENAME=/
```
