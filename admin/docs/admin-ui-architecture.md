# Admin UI Architecture

Tài liệu này là chuẩn thiết kế và kiến trúc UI cho phần `admin` của Quiz. Mục tiêu là giữ các màn quản trị đồng nhất về layout, spacing, màu sắc, trạng thái tương tác và cách tổ chức component.

## Hiện Trạng

Admin đang dùng React, Vite, Ant Design và CSS thuần/module CSS.

Các điểm neo đã có:

- `src/styles/global/tokens.css`: design tokens cho màu, surface, border, shadow, radius, light/dark theme.
- `src/styles/global/base.css`: nền app, font Inter, focus visible.
- `src/styles/layouts/ManagementPageLayout.module.css`: layout chuẩn cho các trang list/manager.
- `src/styles/ui/buttons.css`: button variants, toolbar buttons, action buttons.
- `src/styles/ui/table.css`: chuẩn hiển thị table, pagination, text trong cell.
- `src/components/common/buttons/AdminButtons.jsx`: toolbar/form button wrappers.
- `src/components/common/table/AdminTable.jsx`: wrapper chuẩn cho Ant Design Table.
- `src/components/common/table/AdminTableActions.jsx`: action button và confirm action trong table.
- `src/components/common/table/AdminTableText.jsx`: text chuẩn trong table cell.
- `src/components/common/filters/AdminFilterControls.jsx`: control chuẩn cho filter bar.
- `src/components/common/forms/AdminFormActions.jsx`: action bar/footer chuẩn cho form page và modal form.
- `src/components/common/layout/AdminFormPageLayout.jsx`: shell chuẩn cho form page dài có back button, header và nội dung form.
- `src/components/common/modal/AdminModalTitle.jsx`: title chuẩn cho modal có icon.
- `src/pages/AdminGroups/components/PermissionSummaryCards.jsx`: summary card chuẩn cho menu/quyền toàn hệ thống/quyền theo môn.
- `src/pages/AdminGroups/components/PermissionPresetGrid.jsx`: grid chọn mẫu quyền, tránh inline grid trong form phân quyền.
- `src/pages/Exam/components/ExamQuestionConfigHeader.jsx`: header cấu hình câu hỏi dùng chung cho tạo/sửa đề.
- `src/pages/Exam/components/ExamQuestionPickerTable.jsx`: table chọn câu hỏi dùng chung cho create manual mode và update exam.
- `src/pages/Home/components/AdminWidgetTable.jsx`: table nhỏ trong dashboard widget, gom cấu hình `size`, `pagination`, `scroll`.
- `src/pages/Question/components/QuestionImportFormParts.jsx`: form sections dùng chung cho import câu hỏi từ page và modal.
- `src/styles/pages/detailModal.css`: answer state/detail modal classes dùng chung cho preview, exam detail và user exam detail.
- `src/utils/ui/messageService.js`: service chung cho toast thao tác; ưu tiên Ant Design `notification` ở góc phải dưới để toast đi từ mép phải vào và stack dần lên trên.

Các màn manager như Category, Subject, Chapter, Question, Exam, User, Documents, Audit Log, Notification phần lớn đã đi theo pattern chung. Dashboard hiện còn dùng layout/style riêng nên nên được gom dần về cùng page shell.

## Nguyên Tắc

1. Mọi màn admin phải ưu tiên component chung trước khi viết UI cục bộ.
2. Mọi màu, border radius, shadow, surface, text color phải lấy từ CSS variables trong `tokens.css`.
3. Mỗi page chỉ quyết định dữ liệu, quyền và hành vi nghiệp vụ; layout và visual treatment đi qua component/layout chung.
4. Ant Design là primitive layer, không dùng trực tiếp tràn lan khi đã có wrapper chung.
5. CSS theo thứ tự ưu tiên: global token -> ui component style -> layout style -> page-specific style. Page-specific chỉ dùng khi thật sự đặc thù.
6. Không tạo thêm palette riêng cho từng page. Nếu cần màu mới, thêm token trước.
7. Mobile layout phải được xử lý ở layout/component chung trước, tránh mỗi page tự sửa một kiểu.

## Layer Kiến Trúc UI

### 1. Token Layer

Vị trí: `src/styles/global/tokens.css`

Sở hữu:

- Màu nền: `--admin-bg`, `--admin-canvas`.
- Surface: `--admin-surface`, `--admin-surface-solid`, `--admin-surface-muted`.
- Border: `--admin-border`, `--admin-border-strong`.
- Text: `--admin-text`, `--admin-muted`, `--admin-subtle`.
- Semantic colors: primary, success, warning, error, info, accent, neutral.
- Radius: `--admin-radius-sm`, `--admin-radius`, `--admin-radius-lg`, `--admin-radius-xl`.
- Shadow: `--admin-shadow`, `--admin-shadow-soft`, `--admin-shadow-lg`.
- Theme variants: light/dark và `data-theme-color`.

Quy tắc:

- Không hard-code màu mới trong page/component.
- Không dùng negative letter spacing cho UI compact.
- Nếu cần spacing token, nên bổ sung ở đây trước khi refactor layout rộng.

### 2. Foundation Style Layer

Vị trí:

- `src/styles/global/base.css`
- `src/styles/vendors/antd.css`

Sở hữu:

- Font mặc định.
- App background.
- Focus state.
- Ant Design override cấp toàn app.

Quy tắc:

- Chỉ đặt rule có tính toàn cục ở đây.
- Không đặt style riêng cho một page trong foundation layer.

### 3. UI Component Layer

Vị trí:

- `src/components/common/buttons`
- `src/components/common/filters`
- `src/components/common/table`
- `src/styles/ui`

Sở hữu:

- Button variants.
- Table wrapper.
- Table action buttons.
- Text trong table.
- Filter controls.
- Reusable cards/forms nếu đã đủ ổn định.

Quy tắc:

- Các trang manager phải dùng `AdminTable`, không dùng trực tiếp `Table` trừ trường hợp dashboard widget hoặc màn đặc thù.
- Action trong table dùng `AdminActionButton`, `AdminConfirmAction`, `AdminTableActions`.
- Text trong cell dùng `AdminTableText` để đồng nhất ellipsis, tooltip và empty state.
- Toolbar buttons dùng `AdminAddButton`, `AdminReloadButton`, `AdminExportButton`, `AdminImportButton`, `AdminResetButton`, `AdminSaveButton`, `AdminCancelButton`.

### 4. Layout Layer

Vị trí:

- `src/layouts/ManagementPageLayout.jsx`
- `src/styles/layouts/ManagementPageLayout.module.css`
- `src/styles/layouts/adminShell.css`

Sở hữu:

- Page container.
- Header/title/toolbar.
- Filter surface.
- Content surface.
- Responsive behavior.

Pattern chuẩn cho list/manager page:

```jsx
<ManagementPageLayout
  title="Tên màn hình"
  extra={toolbarActions}
  filters={filterControls}
  table={table}
  onReload={reload}
  onAdd={openCreateModal}
/>
```

Quy tắc:

- Không tự tạo header riêng cho manager page.
- Không bọc card lồng card trong content.
- `ManagementPageLayout` là nơi chuẩn hóa khoảng cách, surface và responsive.
- Dashboard nên có `DashboardPageLayout` hoặc mở rộng `ManagementPageLayout` thành `AdminPageLayout` dùng chung cho cả dashboard và manager.

### 5. Page Feature Layer

Vị trí: `src/pages/*`

Sở hữu:

- Hook nghiệp vụ.
- API interaction.
- Permission logic.
- Column definition.
- Modal/form riêng của feature.
- Text nghiệp vụ.

Quy tắc:

- Page không định nghĩa button/table visual mới.
- Page chỉ truyền variant/action/icon vào component chung.
- Modal form nên dùng cùng footer pattern: `AdminCancelButton` + `AdminSaveButton`.
- Form page nên dùng `AdminFormActions` thay vì tự dựng `Space`/inline style cho nút Lưu/Hủy.
- Form page dài nên dùng `AdminFormPageLayout` thay vì tự dựng `div style={{ padding: 24 }}`, `MainBackButton` và title riêng.
- Filter bar nên dùng component trong `AdminFilterControls`.
- Toast thao tác dùng `appMessage` từ `utils/ui/messageService`, không import trực tiếp `message` hoặc `notification` từ `antd` trong page/hook.

## Page Patterns

### Manager/List Page

Áp dụng cho Category, Subject, Chapter, Question, Exam, User, Documents, Audit Log, Notification.

Chuẩn:

- Header có title bên trái, toolbar bên phải.
- Filter surface nằm dưới header nếu có filter.
- Content surface chứa duy nhất table hoặc trạng thái empty/error.
- Table có row action cố định ở cột cuối khi cần.
- Action icons dùng cùng semantic variants:
  - View/download/preview: `info`
  - Edit: `warning`
  - Assign/special action: `accent`
  - Restore: `success`
  - Disable/delete/recall: `danger`

### Form Page

Áp dụng cho create/update page.

Chuẩn:

- Header có title và back/cancel action.
- Shell dùng `AdminFormPageLayout` để thống nhất padding, back button và page header.
- Form đặt trong một content surface.
- Footer action nằm cuối form, dùng `AdminCancelButton` và `AdminSaveButton`.
- Footer/action bar dùng `AdminFormActions`, bật `sticky` khi form dài cần giữ hành động trong tầm nhìn.
- Không dùng button Ant Design trực tiếp nếu đã có wrapper.

### Dashboard Page

Hiện trạng dashboard dùng `dashboard-header`, `DashboardCard`, `SortableWidget`.

Chuẩn đề xuất:

- Dùng chung page header với manager page.
- Widget card dùng token surface/radius/shadow giống content surface.
- Table nhỏ trong dashboard vẫn có thể dùng Ant Design `Table`, nhưng nên bổ sung wrapper `AdminWidgetTable` nếu lặp lại.
- Các table nhỏ trong dashboard hiện dùng `AdminWidgetTable`; nếu thêm widget table mới, ưu tiên wrapper này.
- Các control như limit select nên có component nhỏ riêng nếu dùng nhiều widget.

### Modal/Dialog

Chuẩn:

- Primary action dùng `modal-primary-btn` hoặc `AdminSaveButton` nếu phù hợp.
- Cancel action dùng `AdminCancelButton`.
- Modal form dùng `buildAdminModalFooter` khi footer chỉ gồm extra action + Hủy + Lưu.
- Modal có icon trong title dùng `AdminModalTitle` thay vì tự style `Title` và icon margin.
- UI tóm tắt quyền dùng `PermissionSummaryCards` để tránh lặp card/tag/empty text.
- UI chọn mẫu quyền trong nhóm admin dùng `PermissionPresetGrid` để thống nhất responsive grid và card.
- Header cấu hình câu hỏi trong Exam create/update dùng `ExamQuestionConfigHeader` để thống nhất title, tổng câu hỏi và action.
- Table chọn câu hỏi trong Exam create/update dùng `ExamQuestionPickerTable` để thống nhất selection, pagination và click row.
- Import câu hỏi dùng `QuestionImportFormParts` để page và modal không tự lặp upload/options/actions.
- Confirm destructive action dùng `AdminConfirmAction` hoặc Ant Design `Modal.confirm` có danger style đồng nhất.
- Không hard-code màu trong modal.

## Exception Có Chủ Đích

- `AdminFilterControls` được phép nhận `style`, `width`, `fullWidth` để tính kích thước control động.
- `SortableWidget` được phép dùng inline `transform`/`transition` từ `@dnd-kit`.
- `CreateNotificationModal` được phép set CSS variable/accent color động theo notification template.
- `QuestionAnswerFields` được phép set CSS variable động cho màu đáp án đúng khi caller truyền `correctColor`.
- `MainBackButton` được phép set CSS variable động cho `topOffset`.
- `LoginCard` được phép lấy `token.colorBgContainer` từ Ant Design theme.
- `MarkdownLatex`/`MarkdownLatexEditor`/`MarkdownPreviewBox` có thể giữ prop `style` passthrough để tương thích caller, nhưng page mới nên ưu tiên class/CSS variable.

## Quy Ước CSS

Thứ tự import/style nên giữ:

1. `global/tokens.css`
2. `global/base.css`
3. `vendors/antd.css`
4. `ui/*.css`
5. `layouts/*.css`
6. `pages/*.css`

Quy tắc đặt class:

- Global reusable class dùng prefix `admin-`: `admin-table`, `admin-form-btn`, `admin-btn--primary`.
- Page-specific class dùng prefix theo page: `dashboard-`, `question-`, `notification-`.
- Module CSS dùng camelCase khi class chỉ thuộc component layout: `managementPageContainer`, `managementHeader`.

## Roadmap Refactor

### Phase 1: Chốt Chuẩn Không Phá UI

- Giữ nguyên tokens hiện tại.
- Ghi nhận `ManagementPageLayout` là chuẩn list page.
- Rà các manager page để đảm bảo đều dùng `AdminTable`, `AdminTableText`, `AdminTableActions`.
- Không thay đổi behavior.

### Phase 2: Tách Page Shell Chung

- Tạo `AdminPageHeader` cho title, subtitle, toolbar.
- Tạo hoặc đổi `ManagementPageLayout` thành một shell rộng hơn:
  - `AdminPageLayout`
  - `AdminManagementLayout`
  - `AdminDashboardLayout`
- Đưa dashboard header về component chung.

### Phase 3: Chuẩn Hóa Filter Và Toolbar

- Chuẩn hóa `AdminFilterControls` cho search, select, date range, segmented/switch.
- Đưa toolbar extra actions về cùng spacing và variant.
- Loại bỏ style filter cục bộ nếu trùng với layout chung.

### Phase 4: Chuẩn Hóa Modal/Form

- Tạo form footer pattern dùng chung.
- Rà create/update/modal page để dùng cùng button, spacing, error state.
- Chuẩn hóa loading/submitting state.

### Phase 5: Dọn CSS Page-Specific

- Giữ page CSS chỉ cho UI thật sự đặc thù như print preview, markdown editor, dashboard drag/drop.
- Di chuyển rule lặp sang `styles/ui` hoặc layout module.
- Xóa legacy styles khi không còn caller.

## Checklist Khi Tạo Màn Admin Mới

- Page có dùng layout chung không?
- Header/toolbar có dùng component chung không?
- Filter có dùng `AdminFilterControls` không?
- Table có dùng `AdminTable` không?
- Cell text dài có dùng `AdminTableText` không?
- Action cột cuối có dùng `AdminTableActions` không?
- Button có dùng wrapper trong `AdminButtons` không?
- Form actions có dùng `AdminFormActions` hoặc `buildAdminModalFooter` không?
- Form page có dùng `AdminFormPageLayout` không?
- Modal title có dùng `AdminModalTitle` không?
- Màu/radius/shadow có lấy từ token không?
- Empty/loading/error state có nhất quán với các page khác không?
- Mobile có vỡ layout header/filter/table action không?

## Quyết Định Mặc Định

- `ManagementPageLayout` là chuẩn hiện tại cho manager/list page.
- `tokens.css` là nguồn sự thật duy nhất cho màu, radius và shadow.
- `AdminTable` là table mặc định trong admin.
- `AdminActionButton` là action button mặc định trong table.
- Dashboard là khu vực ưu tiên refactor tiếp theo để đồng bộ page header và card surface.
- `AdminFilterBar` là wrapper mặc định cho filter area trong manager/list page; không dùng `Space wrap` trực tiếp cho filter chính của page.
