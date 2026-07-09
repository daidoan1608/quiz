import React, { useState } from "react";
import { publicAxios } from "../api/axiosConfig";
import { useAuth } from "../context/AuthProvider";
import { Form, Input, Button, Card, Typography, message, theme } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function Login() {
  const { login } = useAuth();
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await publicAxios.post("/auth/login", {
        username: values.username,
        password: values.password,
      });

      const { accessToken, refreshToken, userId, role } = response.data.data;

      if (role === "USER") {
        message.error("Bạn không có quyền truy cập trang quản trị!");
        return;
      }

      login(accessToken, refreshToken, userId, role, values.username);
      message.success("Đăng nhập thành công!");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(circle at top left, rgba(19,127,236,.16), transparent 34rem), radial-gradient(circle at bottom right, rgba(16,185,129,.13), transparent 28rem), var(--admin-bg)",
      }}
    >
      <Card
        bordered={false}
        style={{
          width: "100%",
          maxWidth: 430,
          borderRadius: 24,
          boxShadow: "var(--admin-shadow)",
          background: token.colorBgContainer,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 22,
              display: "grid",
              placeItems: "center",
              margin: "0 auto 18px",
              color: "#fff",
              fontSize: 28,
              fontWeight: 800,
              background: `linear-gradient(135deg, ${token.colorPrimary}, #10b981)`,
              boxShadow: "0 18px 40px rgba(19,127,236,.24)",
            }}
          >
            Q
          </div>
          <Title level={2} style={{ margin: 0, letterSpacing: "-0.04em" }}>
            VNUA Quiz
          </Title>
          <Text type="secondary">Đăng nhập hệ thống quản trị</Text>
        </div>

        <Form name="login_form" onFinish={onFinish} size="large" layout="vertical" requiredMark={false}>
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Nhập tên đăng nhập" />
          </Form.Item>

          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Button type="primary" htmlType="submit" block loading={loading} icon={<LoginOutlined />} style={{ height: 44 }}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
