import { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authApi } from 'api/services/authApi';
import { getApiErrorMessage } from 'api/http/apiError';

export const useForgotPasswordFlow = (form) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [token, setToken] = useState('');

  const handleApiRequest = async (url, data, onSuccess) => {
    setLoading(true);
    try {
      const response = await authApi.requestPasswordReset(url, data);

      if (response.status === 200 && response.data?.status === 'success') {
        onSuccess(response.data);
      } else {
        message.error(
          response.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!'
        );
      }
    } catch (error) {
      message.error(
        getApiErrorMessage(
          error,
          'Không thể xử lý yêu cầu. Vui lòng thử lại!'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = (values) => {
    handleApiRequest('otp/send', { email: values.email }, () => {
      message.success('Mã OTP đã được gửi!');
      setEmail(values.email);
      setStep(2);
    });
  };

  const handleVerifyOtp = () => {
    if (otpValue.length !== 6) {
      message.error('Mã OTP phải gồm 6 ký tự!');
      return;
    }

    handleApiRequest('otp/verify', { email, otp: otpValue }, (res) => {
      message.success('Xác thực thành công!');
      setToken(res.data);
      setStep(3);
      form.resetFields();
    });
  };

  const handleResetPassword = (values) => {
    handleApiRequest(
      'otp/reset',
      {
        resetToken: token,
        newPassword: values.password,
      },
      () => {
        message.success('Đổi mật khẩu thành công!');
        navigate('/login');
      }
    );
  };

  return {
    email,
    handleResetPassword,
    handleSendOtp,
    handleVerifyOtp,
    loading,
    navigate,
    otpValue,
    setOtpValue,
    step,
  };
};
