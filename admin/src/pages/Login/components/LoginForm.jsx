import React from "react";
import { Button, Form, Input } from "antd";
import { LockOutlined, LoginOutlined, UserOutlined } from "@ant-design/icons";
import { LOGIN_FORM_RULES } from "../constants";
import styles from "../../../styles/pages/Login.module.css";

export default function LoginForm({ loading, onSubmit }) {
  return (
    <Form
      name="login_form"
      onFinish={onSubmit}
      size="large"
      layout="vertical"
      requiredMark={false}
    >
      <Form.Item name="username" label="Tên đăng nhập" rules={LOGIN_FORM_RULES.username}>
        <Input prefix={<UserOutlined />} placeholder="Nhập tên đăng nhập" />
      </Form.Item>

      <Form.Item name="password" label="Mật khẩu" rules={LOGIN_FORM_RULES.password}>
        <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
      </Form.Item>

      <Form.Item className={styles.submitItem}>
        <Button
          type="default"
          htmlType="submit"
          block
          loading={loading}
          icon={<LoginOutlined />}
          className={styles.submitButton}
        >
          Đăng nhập
        </Button>
      </Form.Item>
    </Form>
  );
}
