import React from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Checkbox, Form } from 'antd';
import { Link } from 'react-router-dom';
import { AuthCard } from 'pages/Auth/components/AuthCard';
import { AuthFooterLink } from 'pages/Auth/components/AuthFooterLink';
import { AuthFormField } from 'pages/Auth/components/AuthFormField';
import { AuthSubmitButton } from 'pages/Auth/components/AuthSubmitButton';
import { GoogleLoginButton } from 'pages/Auth/components/GoogleLoginButton';

export const LoginView = ({
  form,
  handleGoogleLoginSuccess,
  handleSubmit,
  loading,
  navigate,
}) => (
  <AuthCard
    navigate={navigate}
    title="ĐĂNG NHẬP"
    subtitle="Chào mừng bạn quay trở lại!"
  >
    <Form
      form={form}
      name="login"
      onFinish={handleSubmit}
      initialValues={{ remember: false }}
      layout="vertical"
      className="auth-form mt-8 space-y-6"
      size="large"
    >
      <AuthFormField
        className="mb-4"
        icon={<UserOutlined className="auth-input-icon" />}
        name="username"
        placeholder="Tên đăng nhập hoặc email"
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập tên đăng nhập hoặc email!',
          },
        ]}
      />

      <AuthFormField
        className="mb-4"
        icon={<LockOutlined className="auth-input-icon" />}
        name="password"
        placeholder="Mật khẩu"
        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        type="password"
      />

      <Form.Item name="remember" valuePropName="checked" className="mb-4">
        <div className="flex items-center justify-between">
          <Checkbox className="auth-checkbox">Ghi nhớ đăng nhập</Checkbox>
          <Link
            to="/forgot"
            className="auth-link text-sm font-medium hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>
      </Form.Item>

      <Form.Item>
        <AuthSubmitButton loading={loading}>Đăng nhập</AuthSubmitButton>
      </Form.Item>
    </Form>

    <div>
      <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full auth-divider-line"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="auth-divider-label px-2">Hoặc đăng nhập với</span>
          </div>
        </div>

      <div className="mt-6 flex justify-center gap-4">
        <GoogleLoginButton onSuccess={handleGoogleLoginSuccess} />
      </div>
    </div>

    <AuthFooterLink
      label="Chưa có tài khoản?"
      linkText="Đăng ký ngay"
      to="/register"
    />
  </AuthCard>
);
