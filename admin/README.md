# VNUA Quiz Admin

Admin web app cho hệ thống VNUA Quiz. Ứng dụng dùng React 18, Vite, Ant Design, Axios, React Router và Recharts.

## Yêu Cầu

- Node.js 22 khuyến nghị
- npm
- Backend API expose endpoint `/api/v1`

## Cài Đặt

```bash
cd admin
npm install
```

Tạo file môi trường local:

```bash
cp .env.local.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.local.example .env.local
```

Biến môi trường:

```ini
VITE_API_URL=http://localhost:8080/api/v1/
VITE_ADMIN_BASENAME=/
```

- `VITE_API_URL`: base URL của backend API.
- `VITE_ADMIN_BASENAME`: basename khi deploy admin dưới sub-path. Dùng `/` nếu deploy ở root domain.

## Scripts

```bash
npm start
npm run dev
npm run build
npm run preview
```

- `npm start` / `npm run dev`: chạy Vite dev server.
- `npm run build`: build production ra `dist`.
- `npm run preview`: preview production build bằng Vite.

Port hiện tại:

- Dev server: `http://localhost:3001`
- Preview server: `http://localhost:3004`
- Docker container: `3001`

Trên Windows nếu gặp PowerShell policy với `npm`, dùng:

```powershell
npm.cmd run build
```

## Build

```bash
npm run build
```

Output:

```text
admin/dist
```

Build hiện tại đã sạch warning CRA/Babel và chunk-size. Vite có tách route lazy loading và vendor chunks trong `vite.config.js`.

## Docker

Build image:

```bash
docker build -t quiz-admin .
```

Build với API production:

```bash
docker build \
  --build-arg VITE_API_URL=https://api.quizvnua.com/api/v1/ \
  --build-arg VITE_ADMIN_BASENAME=/ \
  -t quiz-admin .
```

Run container:

```bash
docker run -p 3001:3001 quiz-admin
```

Dockerfile dùng Node 22 Alpine, `npm ci`, build Vite ra `dist`, rồi serve bằng:

```bash
serve -s dist -l 3001
```

## Cấu Trúc

```text
src/
  api/          Axios config, HTTP helpers, API services
  components/   Shared UI components
  config/       Vite env mapping
  context/      Auth/theme providers và route guards
  hooks/        Shared hooks
  layouts/      Admin shell layouts
  pages/        Feature folders
  routes/       Route config, lazy routes, permission guard mapping
  styles/       CSS, CSS modules, design tokens, AntD overrides
  utils/        Pure helpers, policy, formatter, UI config
```

## Quy Ước Feature

Mỗi page theo cấu trúc:

```text
pages/<Feature>/
  index.jsx
  components/
  hooks/
  constants.js hoặc constants.jsx nếu có JSX config
  utils/
```

Quy ước maintain:

- `index.jsx` chỉ nối hook với view.
- UI component không gọi API trực tiếp.
- API calls đặt trong `api/services`.
- State/data orchestration đặt trong hooks.
- Helper thuần đặt trong `utils`.
- File trong `styles` chỉ là `.css` hoặc `.module.css`.
- Component dùng một feature thì để trong `pages/<Feature>/components`.
- Component dùng nhiều feature thì để trong `components/common`.

## Routing Và Code Splitting

Routes nằm ở:

```text
src/routes/adminLayoutRoutes.jsx
src/routes/ContentRoutes.jsx
```

Các page được load bằng `React.lazy()` và bọc `Suspense` để giảm initial bundle. Khi thêm page mới, thêm route vào `adminLayoutRoutes.jsx` và cập nhật permission policy nếu page cần guard theo menu.

Vendor chunk splitting nằm trong:

```text
vite.config.js
```

Các nhóm chính:

- `vendor-antd`
- `vendor-react`
- `vendor-charts`
- `vendor-dnd`
- `vendor-http`

## CSS

`src/index.css` chỉ là manifest import CSS.

Các nhóm style:

- `styles/global`: token, reset, base.
- `styles/vendors`: override thư viện bên ngoài.
- `styles/layouts`: admin shell/layout.
- `styles/ui`: UI primitives.
- `styles/pages`: style theo page/workflow.

CSS module hiện dùng cho phần có scope rõ:

- `styles/layouts/ManagementPageLayout.module.css`
- `styles/pages/Login.module.css`
