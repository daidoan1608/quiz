import React from 'react';
import { Form, Input } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { AuthCard } from 'pages/Auth/components/AuthCard';
import { AuthFooterLink } from 'pages/Auth/components/AuthFooterLink';
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
        <Form.Item
          name="username"
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
          className="mb-4"
        >
          <Input
            placeholder="Tên đăng nhập"
            prefix={<UserOutlined className="auth-input-icon" />}
            className="rounded-lg py-2.5"
          />
        </Form.Item>

        <Form.Item
          name="fullName"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          className="mb-4"
        >
          <Input
            placeholder="Họ và tên"
            prefix={<UserOutlined className="auth-input-icon" />}
            className="rounded-lg py-2.5"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' },
          ]}
          className="mb-4"
        >
          <Input
            placeholder="Email"
            prefix={<MailOutlined className="auth-input-icon" />}
            className="rounded-lg py-2.5"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
          ]}
          className="mb-4"
        >
          <Input.Password
            placeholder="Mật khẩu"
            prefix={<LockOutlined className="auth-input-icon" />}
            className="rounded-lg py-2.5"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            createConfirmPasswordRule('Mật khẩu xác nhận không khớp!'),
          ]}
          className="mb-6"
        >
          <Input.Password
            placeholder="Xác nhận mật khẩu"
            prefix={<LockOutlined className="auth-input-icon" />}
            className="rounded-lg py-2.5"
          />
        </Form.Item>

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
