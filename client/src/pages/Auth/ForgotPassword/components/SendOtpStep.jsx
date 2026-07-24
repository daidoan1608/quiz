import React from 'react';
import { Button, Form } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { AuthFormField } from 'pages/Auth/components/AuthFormField';

export const SendOtpStep = ({ form, handleSendOtp, loading }) => (
  <Form
    form={form}
    layout="vertical"
    onFinish={handleSendOtp}
    size="large"
    className="space-y-4"
  >
    <AuthFormField
      icon={<MailOutlined className="text-gray-400" />}
      inputClassName="rounded-xl py-2"
      name="email"
      placeholder="Email của bạn"
      rules={[
        { required: true, message: 'Vui lòng nhập email!' },
        { type: 'email', message: 'Email không hợp lệ!' },
      ]}
    />

    <Button
      type="primary"
      htmlType="submit"
      loading={loading}
      block
      className="auth-primary-btn h-12 rounded-xl font-semibold text-lg transition-all duration-300"
    >
      Gửi mã OTP
    </Button>
  </Form>
);
