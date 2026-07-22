import React from 'react';
import { Button, Form } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { createConfirmPasswordRule } from 'pages/Auth/components/ConfirmPasswordRule';
import { AuthFormField } from 'pages/Auth/components/AuthFormField';

export const ResetPasswordStep = ({ form, handleResetPassword, loading }) => (
  <Form
    form={form}
    layout="vertical"
    onFinish={handleResetPassword}
    size="large"
    className="space-y-4"
  >
    <AuthFormField
      icon={<LockOutlined className="text-gray-400" />}
      inputClassName="rounded-xl py-2"
      name="password"
      placeholder="Mật khẩu mới"
      rules={[
        { required: true, message: 'Nhập mật khẩu!' },
        { min: 6, message: 'Tối thiểu 6 ký tự!' },
      ]}
      type="password"
    />

    <AuthFormField
      dependencies={['password']}
      icon={<LockOutlined className="text-gray-400" />}
      inputClassName="rounded-xl py-2"
      name="confirmPassword"
      placeholder="Nhập lại mật khẩu"
      rules={[
        { required: true, message: 'Xác nhận mật khẩu!' },
        createConfirmPasswordRule('Mật khẩu không khớp!'),
      ]}
      type="password"
    />

    <Button
      type="primary"
      htmlType="submit"
      loading={loading}
      block
      className="auth-primary-btn h-12 rounded-xl font-semibold text-lg transition-all duration-300 mt-6"
    >
      Hoàn tất
    </Button>
  </Form>
);
