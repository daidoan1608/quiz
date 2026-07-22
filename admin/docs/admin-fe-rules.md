# Rule phat trien, bao tri va van hanh FE Admin

Tai lieu nay dung cho ung dung `quiz-admin` trong thu muc `admin`. Muc tieu la giu FE admin de phat trien, de bao tri, an toan khi van hanh va nhat quan voi kien truc hien tai: React 18, Vite, Ant Design 5, React Router, Axios, CSS module/global styles.

## 1. Rule tong quan

- Lam viec trong scope `admin`; khong tao runtime shared code voi app `client` neu khong co yeu cau ro rang.
- Uu tien sua theo pattern san co truoc khi tao abstraction moi.
- Moi thay doi user-facing phai dam bao: dung nghiep vu, loading/error ro rang, khong pha responsive layout, build pass.
- Giu UTF-8 cho tat ca source, config, docs, dac biet noi dung tieng Viet.
- Khong dua secret vao source code, `.env.*`, log, screenshot hay tai lieu noi bo.

## 2. Rule cau truc thu muc

- Feature moi dat trong `src/pages/<Feature>/`.
- Page entry `src/pages/<Feature>/index.jsx` phai mong: chi ket noi hook, view component, route-level action.
- UI dat trong `components/`; component UI nhan props va callback, khong goi API truc tiep.
- State/data orchestration dat trong `hooks/`: loading, filters, pagination, modal state, submit handler.
- HTTP request dat trong `src/api/services/<feature>Api.js`; khong goi `authAxios`/`publicAxios` truc tiep tu component.
- Option list, table columns, status map, permission key dat trong `constants/`.
- Pure helper dung rieng cho mot feature dat gan feature do; chi dua len `src/utils` khi co tu 2 noi su dung that.
- CSS cua feature dat trong `styles/` hoac CSS module gan feature; khong dat JS style object trong `styles`.

Mau feature nen dung:

```text
src/api/services/<feature>Api.js
src/pages/<Feature>/
  index.jsx
  components/
    <Feature>View.jsx
    <Feature>Table.jsx
    <Feature>FormModal.jsx
    <Feature>DetailDrawer.jsx
  hooks/
    use<Feature>.js
    use<Feature>Form.js
  constants/
    <feature>Options.js
    <feature>TableColumns.jsx
  styles/
    <feature>.module.css
```

## 3. Rule API va auth

- Dung `authAxios` cho API can admin authentication; dung `publicAxios` cho login, refresh, auth public flow.
- Import Axios client tu `src/api/axiosConfig.js`.
- Service API chi lam HTTP va normalize response; khong import React, Ant Design, component, hook.
- Dung `unwrapApiData` va `normalizeList` tu `src/api/services/apiResponse.js` khi xu ly response.
- Ten ham service uu tien on dinh: `getAll`, `getById`, `create`, `update`, `remove`, `restore`, `search`, `filter`.
- Khong xu ly refresh token rieng le trong feature. Co che refresh, CSRF retry va redirect login da nam trong `axiosConfig.js`.
- Loi hien thi cho nguoi dung nen lay tu backend qua `getApiErrorMessage`, co fallback tieng Viet ngan gon.
- Khong match error string ky thuat neu co the dua vao `HTTP status` hoac field response co cau truc.

## 4. Rule UI/UX admin

- CRUD/list page uu tien dung `ManagementPageLayout`.
- Header/action dung component common san co nhu `AdminPageHeader`, `AdminAddButton`, `AdminReloadButton`.
- Uu tien Ant Design components: `Table`, `Form`, `Modal`, `Drawer`, `Tabs`, `Segmented`, `Switch`, `Select`, `DatePicker`, `Tooltip`, `Popconfirm`.
- Man hinh admin can thien ve tac vu: gon, de scan, it trang tri, tap trung filter/table/action.
- Khong them text huong dan dai dong trong UI neu workflow da ro bang controls.
- Icon button phai co tooltip neu y nghia khong hien nhien.
- Table phai co `rowKey` on dinh, loading state, empty state hop ly va pagination/filter ro rang khi danh sach lon.
- Modal form phai reset state khi dong/mo neu flow yeu cau; submit phai co loading/debounce de tranh double submit.
- Khong dat API call trong render path; tranh tinh toan nang trong component render.

## 5. Rule routing va navigation

- Route admin khai bao trong `src/routes/adminLayoutRoutes.jsx`.
- Page route phai lazy load bang `React.lazy`.
- Route chi tiet dat trong `adminDetailRoutes` va khai bao `parentPath` de giu dieu huong/active menu dung.
- Neu feature can hien trong menu/sidebar, cap nhat navigation policy va permission policy lien quan trong `src/utils/adminNavigationPolicy.js` va `src/utils/adminAccessPolicy.js`.
- Khong hard-code URL goc; dung config basename/API root khi can.

## 6. Rule config va environment

- Chi doc env thong qua `src/config/env.js`.
- Env public cua Vite phai co prefix `VITE_`.
- Bien hien tai:
  - `VITE_API_URL`: API base, mac dinh `/api/v1/`.
  - `VITE_ADMIN_BASENAME`: base path cua admin, mac dinh `/`.
- Khi them env moi, cap nhat `.env.local.example`, `.env.production.example`, Docker build args neu can.
- Khong import truc tiep `import.meta.env` rai rac trong feature.

## 7. Rule styling

- Dung design tokens/global styles san co trong `src/styles/global` va UI styles trong `src/styles/ui`.
- CSS module dung cho layout/feature co scope ro; global CSS chi dung cho pattern dung chung.
- Khong tao palette hoac visual language moi neu chi sua mot feature.
- Dam bao text khong tran nut/card/table cell o viewport nho.
- Khong boc card trong card neu khong co ly do UI ro rang.

## 8. Rule bao tri

- Truoc khi refactor, tim feature gan nhat va mirror pattern.
- Moi refactor phai giu nguyen behavior tru khi co yeu cau thay doi.
- Tach file theo ownership, khong dua component mot-feature vao `components/common`.
- Xoa code chet, import thua, log debug truoc khi merge.
- Neu sua flow auth, permission, API response normalization, route hoac layout common, can test lai cac man CRUD chinh.
- Khi gap text tieng Viet loi font/mojibake, kiem tra encoding va surrounding content truoc khi sua.

## 9. Rule van hanh va deploy

- Build production bang:

```powershell
npm.cmd run build
```

- Preview artifact neu can:

```powershell
npm.cmd run preview
```

- `dist/` la build output cua Vite; khong dung convention cua CRA.
- Docker image build FE va serve static `dist` tren port `3001`.
- Khi deploy duoi sub-path, set dung `VITE_ADMIN_BASENAME` tai build time.
- Khi API domain thay doi, set dung `VITE_API_URL` tai build time; luu y app static can rebuild de nhan env moi.
- Neu backend dung cookie/session, production phai dam bao CORS, `withCredentials`, CSRF cookie va HTTPS/domain config tuong thich voi `axiosConfig.js`.
- Sau deploy, smoke test toi thieu:
  - Mo login page.
  - Login admin thanh cong.
  - Refresh trang khong bi mat session bat thuong.
  - Mo Dashboard va mot CRUD page.
  - Thu mot request ghi du lieu de kiem tra CSRF.
  - Logout va dam bao redirect/login state dung.

## 10. Rule kiem tra truoc khi merge

- Chay build tu thu muc `admin`:

```powershell
npm.cmd run build
```

- Kiem tra console browser khong co runtime error nghiem trong.
- Kiem tra network cho API moi: status, payload, credentials, CSRF.
- Kiem tra route reload truc tiep tren browser cho page moi.
- Kiem tra permission/navigation neu feature chi danh cho nhom admin nhat dinh.
- Kiem tra responsive toi thieu desktop va mobile width voi form/table quan trong.

## 11. Checklist them feature moi

1. Xac dinh endpoint backend va permission can co.
2. Tao `src/api/services/<feature>Api.js`.
3. Tao hook quan ly list/detail/form trong `src/pages/<Feature>/hooks`.
4. Tao view/table/modal/drawer trong `components`.
5. Tao constants cho columns/options/status.
6. Giu `index.jsx` mong.
7. Them route lazy trong `adminLayoutRoutes.jsx` hoac `adminDetailRoutes`.
8. Cap nhat navigation/permission policy neu can.
9. Them style scoped neu UI can.
10. Chay `npm.cmd run build`.

## 12. Definition of Done

Mot thay doi FE admin chi duoc xem la xong khi:

- Code dung dung layer va ownership.
- API/auth/CSRF/permission khong bi bypass.
- UI co loading/error/empty state phu hop.
- Build production pass.
- Khong co secret, log debug, import thua, code chet.
- Tai lieu/env/route/navigation duoc cap nhat neu thay doi anh huong van hanh.
