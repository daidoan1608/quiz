import React from 'react';
import { Form } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { AuthCard } from 'pages/Auth/components/AuthCard';
import { AuthFooterLink } from 'pages/Auth/components/AuthFooterLink';
import { AuthFormField } from 'pages/Auth/components/AuthFormField';
import { AuthSubmitButton } from 'pages/Auth/components/AuthSubmitButton';
import { createConfirmPasswordRule } from 'pages/Auth/components/ConfirmPasswordRule';

export const RegisterView = ({ form, handleSubmit, loading, navigate }) => (
  <AuthCard
    navigate={navigate}
    title="ĐĂNG KÝ TÀI KHOẢN"
    subtitle="Tạo tài khoản để bắt đầu hành trình học tập"
  >
    <Form
        form={form}
        name="register"
        autoComplete="off"
        layout="vertical"
        onFinish={handleSubmit}
        className="auth-form mt-8 space-y-5"
        size="large"
      >
        <AuthFormField
          className="mb-4"
          icon={<UserOutlined className="auth-input-icon" />}
          name="username"
          placeholder="Tên đăng nhập"
          rules={[
            { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
            { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
            { max: 20, message: 'Tên đăng nhập không được quá 20 ký tự!' },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message:
                'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới!',
            },
          ]}
        />

        <AuthFormField
          className="mb-4"
          icon={<UserOutlined className="auth-input-icon" />}
          name="fullName"
          placeholder="Họ và tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
        />

        <AuthFormField
          className="mb-4"
          icon={<MailOutlined className="auth-input-icon" />}
          name="email"
          placeholder="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' },
          ]}
        />

        <AuthFormField
          className="mb-4"
          icon={<LockOutlined className="auth-input-icon" />}
          name="password"
          placeholder="Mật khẩu"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
          ]}
          type="password"
        />

        <AuthFormField
          className="mb-6"
          dependencies={['password']}
          icon={<LockOutlined className="auth-input-icon" />}
          name="confirmPassword"
          placeholder="Xác nhận mật khẩu"
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            createConfirmPasswordRule('Mật khẩu xác nhận không khớp!'),
          ]}
          type="password"
        />

      <Form.Item>
        <AuthSubmitButton loading={loading}>Đăng ký ngay</AuthSubmitButton>
      </Form.Item>
    </Form>

    <AuthFooterLink
      label="Đã có tài khoản?"
      linkText="Đăng nhập ngay"
      to="/login"
    />
  </AuthCard>
);
