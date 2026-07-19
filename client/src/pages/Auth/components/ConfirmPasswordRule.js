export const createConfirmPasswordRule = (
  message = 'Mật khẩu xác nhận không khớp!'
) =>
  ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    },
  });
