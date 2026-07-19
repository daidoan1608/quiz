# VNUA Quiz Admin

Admin web app cho hệ thống VNUA Quiz. Ứng dụng dùng React 18, Create React App, Ant Design, Axios, React Router và Recharts.

## Yêu cầu môi trường

- Node.js 20 khuyến nghị
- npm
- Backend API đang chạy và expose endpoint `/api/v1`

Project có file `admin/.npmrc` với:

```ini
legacy-peer-deps=true
```

Giữ file này để `npm install` ổn định với dependency stack hiện tại của CRA/React.

## Cài đặt

```bash
cd admin
npm install
```

Tạo file môi trường local từ file mẫu:

```bash
cp .env.local.example .env.local
```

Trên Windows PowerShell có thể dùng:

```powershell
Copy-Item .env.local.example .env.local
```

Biến môi trường chính:

```ini
REACT_APP_API_URL=http://localhost:8080/api/v1/
REACT_APP_ADMIN_BASENAME=/
```

- `REACT_APP_API_URL`: base URL của backend API.
- `REACT_APP_ADMIN_BASENAME`: basename khi deploy admin dưới sub-path. Để `/` nếu chạy ở root domain.

## Chạy development

```bash
npm start
```

Mặc định CRA chạy ở:

```text
http://localhost:3000
```

## Build production

```bash
npm run build
```

Output nằm ở:

```text
admin/build
```

Trên Windows nếu gặp policy với `npm`, dùng:

```powershell
npm.cmd run build
```

## Docker

Build image:

```bash
docker build -t quiz-admin .
```

Có thể truyền API URL khi build:

```bash
docker build \
  --build-arg REACT_APP_API_URL=https://api.quizvnua.com/api/v1/ \
  --build-arg REACT_APP_ADMIN_BASENAME=/ \
  -t quiz-admin .
```

Run container:

```bash
docker run -p 3001:3001 quiz-admin
```

App được serve bằng `serve -s build -l 3001`.

## Cấu trúc thư mục

```text
src/
  api/          Axios config, HTTP helpers, API service functions
  components/   Shared UI components dùng nhiều nơi
  context/      Auth/theme/provider và route guard
  hooks/        Shared hooks không thuộc riêng page nào
  layouts/      Layout shell dùng chung
  pages/        Feature pages, mỗi page tự quản components/hooks/constants/utils
  routes/       Route declarations và route guard mapping
  styles/       CSS, CSS modules, global tokens, AntD overrides
  utils/        Helper thuần, policy, formatter, UI config
```

## Quy ước kiến trúc

Admin đang theo hướng feature-first:

- `pages/<Feature>/index.jsx`: entry của page, chỉ nối hook với view.
- `pages/<Feature>/components`: UI component của riêng feature.
- `pages/<Feature>/hooks`: state, side effects, data orchestration của feature.
- `pages/<Feature>/constants.js`: option, message, initial values.
- `pages/<Feature>/utils`: helper chỉ dùng trong feature đó.

Shared code:

- `components/common`: chỉ chứa UI component dùng nhiều feature.
- `hooks`: hook dùng chung toàn admin.
- `api/services`: toàn bộ API calls.
- `utils`: helper thuần, không render JSX.
- `styles`: chỉ chứa `.css` và `.module.css`.

Không đặt API call trực tiếp trong `.jsx` component. Component chỉ render UI và nhận props/callback. Data fetching nên nằm trong hook hoặc service.

## CSS và style

`src/index.css` chỉ là file import manifest.

Các nhóm CSS chính:

- `styles/global`: token, reset, base style.
- `styles/vendors`: override thư viện bên ngoài như Ant Design.
- `styles/layouts`: style layout shell.
- `styles/ui`: primitive UI class dùng chung.
- `styles/pages`: style theo page hoặc workflow cụ thể.

CSS module đang dùng cho những phần có scope rõ:

- `styles/layouts/ManagementPageLayout.module.css`
- `styles/pages/Login.module.css`

## Kiểm tra nhanh trước khi commit

```bash
npm run build
```

Một số warning hiện tại của CRA/Babel hoặc bundle size có thể xuất hiện. Miễn `Compiled successfully` là build đã pass.

## Ghi chú maintain

- Không thêm component modal/page mới vào `components/common` nếu chỉ một feature dùng.
- Nếu nhiều feature dùng chung table/cell/renderer, đặt ở `components/common`.
- Nếu chỉ một feature dùng, để trong `pages/<Feature>/components`.
- Nếu helper có JSX, không đặt trong `utils`.
- Nếu file nằm trong `styles`, chỉ dùng CSS/CSS module.
- Nếu thêm page mới, khai báo route ở `src/routes/adminLayoutRoutes.jsx` và permission mapping ở policy tương ứng nếu cần.
