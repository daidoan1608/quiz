# Quy chuẩn xây dựng Frontend

Tài liệu này tổng hợp từ `DESIGN.md` (Aura Modern Light) và `DESIGN (1).md` (Aura Modern Dark), dùng làm chuẩn khi xây dựng/cập nhật UI cho `client` và `admin`.

## 1. Tinh thần thiết kế

- Ưu tiên sự rõ ràng, hiệu quả, chuyên nghiệp và dễ tập trung.
- UI cần hiện đại, tối giản, cân bằng giữa mật độ thông tin và khoảng thở.
- Nội dung là trọng tâm; hạn chế trang trí nặng, shadow/border quá mạnh.
- Light mode mang cảm giác sạch, sáng, corporate modern.
- Dark mode mang cảm giác command center, cao cấp, giảm mỏi mắt bằng slate tối thay vì đen tuyệt đối.

## 2. Theme màu

### Light theme

- Nền chính: `#f7f9fb` hoặc `#ffffff` cho canvas sáng/sạch.
- Container nhẹ: `#f2f4f6`, `#eceef0`, `#F8FAFC`.
- Text chính: `#191c1e`.
- Text phụ: `#424754`.
- Primary/action: `#0058be` hoặc `#2170e4`.
- Border/outline: `#c2c6d6`, input border có thể dùng `#E2E8F0`.
- Error: `#ba1a1a`; success/warning/error dùng màu semantic nhưng tiết chế.

### Dark theme

- Nền chính: `#101415` hoặc slate base gần `#0f172a`.
- Container level 1: `#1d2022` hoặc `#1e293b`.
- Container cao hơn/modal: `#272a2c`, `#323537`, `#334155`.
- Text chính: `#e0e3e5` hoặc `#f8fafc`.
- Text phụ: `#c1c7d3` hoặc `#94a3b8`.
- Primary/action: `#60a5fa` hoặc `#a4c9ff`.
- Border: `#334155`, `#414751`.

## 3. Typography

- Font chuẩn: **Inter**.
- Heading dùng `font-weight: 600-700`, letter spacing âm nhẹ khi cần.
- Body chính: 16px, line-height 24px.
- Body lớn: 18px, line-height 28px.
- Body nhỏ: 14px, line-height 20px.
- Label: 12-14px, `font-weight: 500-600`; với metadata/category có thể dùng uppercase và letter spacing lớn hơn.
- Không dùng quá nhiều font-size tùy biến; ưu tiên scale có sẵn để giao diện nhất quán.

## 4. Layout & spacing

- Dùng grid linh hoạt:
  - Desktop: 12 columns, gutter 24px, margin ngoài 48px.
  - Tablet: 8 columns, gutter 16-24px.
  - Mobile: 4 columns hoặc single-column stack, margin ngoài 16px.
- Max-width nội dung:
  - Light/system chung: khoảng 1280px.
  - Dashboard/SaaS rộng: có thể đến 1440px.
- Spacing dựa trên baseline 4px/8px:
  - Nhỏ: 4-8px.
  - Chuẩn: 16px.
  - Section/card: 24px.
  - Block lớn: 40px.
  - Khoảng cách section quan trọng: 64px.
- Mobile giảm spacing xuống một bậc để tiết kiệm màn hình.

## 5. Radius, elevation, depth

- Radius chuẩn cho button/input/card nhỏ: 12px (`0.75rem`).
- Small elements như checkbox/tag nhỏ: 4-6px.
- Badge/chip: pill `9999px`.
- Modal/container lớn: 16-24px.

### Light elevation

- Ưu tiên tonal layer và whitespace hơn border/shadow nặng.
- Shadow nhẹ cho dropdown/card active: `0px 10px 15px -3px rgba(0, 0, 0, 0.05)`.
- Card trên nền trắng có thể dùng border 1px rất nhạt `#F1F5F9`.

### Dark elevation

- Không dùng shadow đậm quá mức cho card thường; dùng tonal elevation.
- Card/container: surface tối hơn nền và 1px top border trắng opacity thấp.
- Modal/popover: surface sáng hơn, shadow `0 20px 25px -5px rgba(0,0,0,0.4)`.
- Sticky nav/backdrop có thể dùng blur khoảng 20px.

## 6. Component standards

### Buttons

- Height chuẩn: khoảng 44px cho touch target tốt.
- Primary light: nền xanh `#0058be`/`#2170e4`, chữ trắng.
- Primary dark: nền `#60a5fa`, chữ slate tối `#0f172a`, font-weight 600.
- Secondary: ghost/subtle background hoặc border 1px.
- Hover: primary sáng hơn khoảng 10%; secondary tăng độ rõ border/background.

### Inputs

- Radius 12px.
- Light: border 1px `#E2E8F0`, focus chuyển primary blue kèm glow nhẹ.
- Dark: background `#1e293b`, border `#334155`; focus border `#60a5fa`, ring primary 20% opacity.
- Placeholder dùng text phụ, không quá tương phản.

### Cards

- Padding card chuẩn: 24px.
- Header card nếu có nên tách bằng divider nhẹ.
- Không lạm dụng nested card; dùng spacing/section title để phân cấp.

### Chips, tags, badges

- Dạng pill.
- Nền tint primary nhẹ, chữ đủ tương phản.
- Dùng semantic colors có kiểm soát cho trạng thái success/warning/error.

### Lists/tables

- Row sạch, dễ scan.
- List item padding dọc khoảng 16px.
- Divider 1px nhạt trong light (`#F1F5F9`) hoặc dark (`#334155`).
- Hover dark: `#334155` với transition 200ms ease-in-out.

## 7. Responsive & accessibility

- Mobile ưu tiên vertical stack, không ép layout desktop xuống màn nhỏ.
- Text/body không nhỏ dưới 14px trừ metadata phụ.
- Đảm bảo contrast cao cho text chính/phụ trên cả light và dark.
- Button/input cần kích thước đủ thao tác; target tối thiểu khoảng 40-44px.
- Trạng thái focus phải nhìn thấy rõ, không chỉ dựa vào màu quá nhẹ.

## 8. Quy chuẩn khi triển khai FE

- Tách API layer rõ ràng; component không hard-code quá nhiều endpoint nếu có thể gom vào service/api module.
- Khi BE có endpoint search/filter/pagination, ưu tiên gọi endpoint BE thay vì chỉ filter client-side với dữ liệu lớn.
- Dùng debounce khoảng 300-500ms cho ô tìm kiếm gọi API.
- Luôn xử lý fallback response: `response.data.data || response.data || []` khi BE có envelope.
- Hiển thị loading/error/empty state rõ ràng.
- Không để magic color rải rác; ưu tiên token/theme class.
- Khi cập nhật UI, kiểm tra cả light/dark nếu component xuất hiện ở cả hai theme.
