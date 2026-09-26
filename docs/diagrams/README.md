# Thư Mục Biểu Đồ Kỹ Thuật (System Diagrams)

Thư mục này chứa toàn bộ các biểu đồ phân tích, thiết kế phần mềm và mô hình hóa dữ liệu của dự án **Quiz VNUA**, tuân thủ chuẩn quốc tế **UML 2.5 (ISO/IEC 19505)** và ký hiệu **Crow's Foot Notation**:

---

## Danh Mục Biểu Đồ

| Tài Liệu Biểu Đồ | Loại Biểu Đồ | Số Lượng | Mô Tả Tóm Tắt |
| :--- | :---: | :---: | :--- |
| **[Sơ Đồ Ca Sử Dụng (Use Case Diagrams)](./use-case.md)** | UML Use Case | 7 biểu đồ | Sơ đồ ca sử dụng tổng thể toàn hệ thống, 6 sơ đồ phân hệ nghiệp vụ chi tiết và 3 bảng đặc tả ca sử dụng trọng tâm. |
| **[Biểu Đồ Hoạt Động & Trạng Thái (Activity & State)](./activity-diagrams.md)** | UML Activity & State | 23 biểu đồ | 22 biểu đồ hoạt động luồng nghiệp vụ chi tiết + 1 biểu đồ máy trạng thái (State Machine) vòng đời bài thi `UserExam`. |
| **[Sơ Đồ Tuần Tự (Sequence Workflows)](./workflows.md)** | UML Sequence | 10 biểu đồ | 10 sơ đồ tuần tự kỹ thuật tải cao (RabbitMQ, Redis, WebSocket, Gemini AI, Alertmanager). |
| **[Sơ Đồ Quan Hệ Thực Thể (ERD & Data Dictionary)](./entity-relationship.md)** | Crow's Foot ERD | 5 biểu đồ | Sơ đồ quan hệ thực thể tổng thể, 4 sơ đồ phân hệ và từ điển dữ liệu (Data Dictionary) cho 23 bảng cơ sở dữ liệu MySQL. |

---

*Các biểu đồ kiến trúc hệ thống và triển khai VPS xem tại: [Kiến Trúc Hệ Thống (Architecture)](../architecture.md).*
