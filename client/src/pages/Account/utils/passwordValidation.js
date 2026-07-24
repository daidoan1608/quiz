export const PASSWORD_MIN_LENGTH = 8;

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export const getPasswordChangeValidationMessage = ({
  confirmPassword,
  newPassword,
  oldPassword,
  texts,
}) => {
  if (!oldPassword || !newPassword || !confirmPassword) {
    return 'Vui lòng nhập đầy đủ thông tin đổi mật khẩu!';
  }

  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    return `Mật khẩu mới phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự!`;
  }

  if (!PASSWORD_PATTERN.test(newPassword)) {
    return 'Mật khẩu mới phải có cả chữ và số!';
  }

  if (oldPassword === newPassword) {
    return 'Mật khẩu mới không được trùng mật khẩu hiện tại!';
  }

  if (newPassword !== confirmPassword) {
    return texts.passwordMismatch || 'Mật khẩu xác nhận không khớp!';
  }

  return '';
};

export const getPasswordSetupValidationMessage = ({
  confirmPassword,
  newPassword,
  texts,
}) => {
  if (!newPassword || !confirmPassword) {
    return 'Vui lòng nhập đầy đủ thông tin thiết lập mật khẩu!';
  }

  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    return `Mật khẩu mới phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự!`;
  }

  if (!PASSWORD_PATTERN.test(newPassword)) {
    return 'Mật khẩu mới phải có cả chữ và số!';
  }

  if (newPassword !== confirmPassword) {
    return texts.passwordMismatch || 'Mật khẩu xác nhận không khớp!';
  }

  return '';
};
