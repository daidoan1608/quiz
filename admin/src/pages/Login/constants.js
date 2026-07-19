export const ADMIN_ALLOWED_ROLES = ["ADMIN", "MOD"];

export const LOGIN_MESSAGES = {
  unauthorized: "Bạn không có quyền truy cập trang quản trị!",
  success: "Đăng nhập thành công!",
  failure: "Đăng nhập thất bại. Vui lòng kiểm tra lại!",
};

export const LOGIN_FORM_RULES = {
  username: [{ required: true, message: "Vui lòng nhập tên đăng nhập!" }],
  password: [{ required: true, message: "Vui lòng nhập mật khẩu!" }],
};
