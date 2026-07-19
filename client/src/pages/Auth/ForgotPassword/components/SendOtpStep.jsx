import React from 'react';
import { Button, Form, Input } from 'antd';
import { MailOutlined } from '@ant-design/icons';

export const SendOtpStep = ({ form, handleSendOtp, loading }) => (
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
);
