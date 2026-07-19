import React from 'react';
import { Button, Form, Input } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { createConfirmPasswordRule } from 'pages/Auth/components/ConfirmPasswordRule';

export const ResetPasswordStep = ({ form, handleResetPassword, loading }) => (
  <Form
    form={form}
    layout="vertical"
    onFinish={handleResetPassword}
    size="large"
    className="space-y-4"
  >
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

    <Form.Item
      name="confirmPassword"
      dependencies={['password']}
      rules={[
        { required: true, message: 'Xác nhận mật khẩu!' },
        createConfirmPasswordRule('Mật khẩu không khớp!'),
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
);
