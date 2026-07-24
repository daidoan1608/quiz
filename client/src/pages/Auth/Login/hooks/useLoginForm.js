import { useEffect, useState } from 'react';
import { appMessage } from 'utils/appMessage';
import { useNavigate } from 'react-router-dom';
import { authApi } from 'api/services/authApi';
import { getApiErrorCode, getApiErrorMessage } from 'api/http/apiError';
import { useAuth } from 'context/auth/AuthProvider';
import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
  storageKeys,
} from 'utils/storage';

export const useLoginForm = (form) => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUsername = getStorageItem(storageKeys.savedUsername);
    if (savedUsername) {
      form.setFieldsValue({
        username: savedUsername,
        remember: true,
      });
    }
  }, [form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const userData = await authApi.loginData({
        username: values.username,
        password: values.password,
      });

      const { userId, role, fullName, avatarUrl, authProvider, hasPassword } = userData || {};
      if (!userId) {
        throw new Error('Login response is missing userId');
      }

      let avatar = avatarUrl || '';
      try {
        const avatarResponse = await authApi.getMyAvatar();
        avatar =
          avatarResponse.data?.data?.avatarUrl ||
          avatarResponse.data?.avatarUrl ||
          avatarUrl ||
          '';
      } catch (avatarError) {
        avatar = avatarUrl || '';
      }
      if (values.remember) {
        setStorageItem(storageKeys.savedUsername, values.username);
        setStorageItem(storageKeys.fullName, fullName);
        setStorageItem(storageKeys.avatarUrl, avatar);
      } else {
        removeStorageItem(storageKeys.savedUsername);
        removeStorageItem(storageKeys.fullName);
        removeStorageItem(storageKeys.avatarUrl);
      }

      const loggedIn = login({
        userId,
        role,
        fullName,
        authProvider,
        hasPassword,
        avatarUrl: avatar,
      });
      if (!loggedIn) {
        await authApi.logout().catch(() => {});
        return;
      }
      navigate('/');
    } catch (error) {
      if (getApiErrorCode(error) === 'ACCOUNT_NEEDS_PASSWORD') {
        appMessage.warning(
          'Tài khoản này đang đăng nhập bằng Google. Bạn có muốn thiết lập mật khẩu để đăng nhập bằng tài khoản/mật khẩu?'
        );
        return;
      }
      const errorMessage = getApiErrorMessage(
        error,
        'Đăng nhập thất bại. Vui lòng thử lại!'
      );
      appMessage.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (idToken) => {
    setLoading(true);
    try {
      const userData = await authApi.loginWithGoogle(idToken);
      const { userId, role, fullName, avatarUrl, authProvider, hasPassword } = userData || {};
      if (!userId) {
        console.error('Google login response is missing userId', userData);
        throw new Error('Google login response is missing userId');
      }

      const loggedIn = login({
        userId,
        role,
        fullName,
        authProvider,
        hasPassword,
        avatarUrl: avatarUrl || '',
      });
      if (!loggedIn) {
        await authApi.logout().catch(() => {});
        return;
      }
      navigate('/');
    } catch (error) {
      console.error(error);
      appMessage.error('Xác thực tài khoản Google thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return {
    handleGoogleLoginSuccess,
    handleSubmit,
    loading,
    navigate,
  };
};

