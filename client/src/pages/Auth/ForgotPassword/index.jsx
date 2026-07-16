import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import {
  MailOutlined,
  LockOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from 'api/authApi';
import OtpInput from 'react-otp-input';

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [token, setToken] = useState(''); // resetToken

  // ================= COMMON API HANDLER =================
  const handleApiRequest = async (url, data, onSuccess) => {
    setLoading(true);
    try {
      const response = await authApi.requestPasswordReset(url, data);

      if (response.status === 200 && response.data?.status === 'success') {
        onSuccess(response.data);
      } else {
        message.error(response.data?.message || 'Có lỗi xảy ra!');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi kết nối server!');
    } finally {
      setLoading(false);
    }
  };

  // ================= STEP 1: SEND OTP =================
  const handleSendOtp = (values) => {
    handleApiRequest('otp/send', { email: values.email }, () => {
      message.success('Mã OTP đã được gửi!');
      setEmail(values.email);
      setStep(2);
    });
  };

  // ================= STEP 2: VERIFY OTP =================
  const handleVerifyOtp = () => {
    if (otpValue.length !== 6) {
      message.error('Mã OTP phải gồm 6 ký tự!');
      return;
    }

    handleApiRequest('otp/verify', { email: email, otp: otpValue }, (res) => {
      message.success('Xác thực thành công!');

      // ✅ BACKEND TRẢ resetToken TRONG data
      const resetToken = res.data;

      setToken(resetToken);
      setStep(3);
      form.resetFields();
    });
  };

  // ================= STEP 3: RESET PASSWORD =================
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

  // ================= RENDER =================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-gray-200">
        {/* HEADER */}
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-3xl font-extrabold text-blue-700 tracking-tight">
            {step === 1 && 'Quên Mật Khẩu'}
            {step === 2 && 'Xác Thực OTP'}
            {step === 3 && 'Đặt Lại Mật Khẩu'}
          </h2>

          {step === 2 && (
            <p className="text-sm text-gray-600 mt-2">
              Mã OTP đã gửi tới <b className="text-gray-800">{email}</b>
            </p>
          )}
          {step === 1 && (
            <p className="text-sm text-gray-500">
              Nhập email đã đăng ký để nhận mã xác thực.
            </p>
          )}
          {step === 3 && (
            <p className="text-sm text-gray-500">
              Vui lòng nhập mật khẩu mới của bạn.
            </p>
          )}
        </div>

        {/* STEP 1: Email Form */}
        {step === 1 && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSendOtp}
            size="large"
            className="space-y-4"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="Email của bạn"
                className="rounded-xl py-2"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-lg transition-all duration-300"
            >
              Gửi mã OTP
            </Button>
          </Form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-center py-2">
              <OtpInput
                value={otpValue}
                onChange={setOtpValue}
                numInputs={6}
                renderSeparator={<span>&nbsp;&nbsp;</span>}
                renderInput={(props) => <input {...props} />}
                inputStyle={{
                  width: '45px',
                  height: '45px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  borderRadius: '10px',
                  border: '1px solid #d9d9d9',
                  transition: 'border-color 0.2s',
                  margin: '0 2px',
                }}
                // CSS cho focus (Tailwind không áp dụng trực tiếp, dùng style object)
                focusStyle={{
                  borderColor: '#3b82f6', // blue-500
                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
                }}
              />
            </div>

            <Button
              type="primary"
              onClick={handleVerifyOtp}
              loading={loading}
              block
              className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-lg transition-all duration-300"
            >
              Xác nhận OTP
            </Button>

            <div className="text-center text-sm pt-2">
              Chưa nhận được mã?{' '}
              <button
                onClick={() => handleSendOtp({ email })}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                Gửi lại
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Reset Password Form */}
        {step === 3 && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleResetPassword}
            size="large"
            className="space-y-4"
          >
            {/* Password Input */}
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Nhập mật khẩu!' },
                { min: 6, message: 'Tối thiểu 6 ký tự!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Mật khẩu mới"
                className="rounded-xl py-2"
              />
            </Form.Item>

            {/* Confirm Password Input */}
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Nhập lại mật khẩu"
                className="rounded-xl py-2"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-lg transition-all duration-300 mt-6"
            >
              Hoàn tất
            </Button>
          </Form>
        )}

        {/* FOOTER */}
        {(step === 1 || step === 2) && (
          <div className="text-center mt-8 pt-4 border-t border-gray-100">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
            >
              <ArrowLeftOutlined /> Quay lại đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
