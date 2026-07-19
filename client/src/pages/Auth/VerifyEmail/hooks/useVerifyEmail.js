import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from 'api/services/authApi';
import { getApiErrorMessage } from 'api/http/apiError';

export const useVerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Thiếu token xác thực email.');
      return;
    }

    const verify = async () => {
      try {
        await authApi.verifyEmail(token);
        setStatus('success');
        setMessage(
          'Email đã được xác thực thành công. Bạn có thể đăng nhập ngay.'
        );
      } catch (error) {
        setStatus('error');
        setMessage(
          getApiErrorMessage(
            error,
            'Xác thực email thất bại hoặc liên kết đã hết hạn.'
          )
        );
      }
    };

    verify();
  }, [searchParams]);

  return {
    message,
    navigate,
    status,
  };
};
