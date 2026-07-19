import { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authApi } from 'api/services/authApi';
import { getApiErrorMessage } from 'api/http/apiError';

export const useRegisterForm = (form) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await authApi.register({
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      });

      message.success(
        'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
        6
      );
      form.resetFields();
    } catch (error) {
      const serverMessage = error.response?.data?.message;
      const validationErrors = error.response?.data?.errors;
      const errorMessage =
        Array.isArray(validationErrors) && validationErrors.length > 0
          ? validationErrors[0]
          : serverMessage === 'Username is already existed'
            ? 'Tên đăng nhập đã tồn tại!'
            : serverMessage === 'Email is already existed'
              ? 'Email đã tồn tại!'
              : getApiErrorMessage(error, 'Đăng ký thất bại. Vui lòng thử lại!');
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSubmit,
    loading,
    navigate,
  };
};
