import React, { useState } from "react";
import { publicAxios } from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  theme,
} from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { token } = theme.useToken(); // Lấy token màu sắc
  const [loading, setLoading] = useState(false);

  // Xử lý đăng nhập
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await publicAxios.post("/auth/login", {
        username: values.username,
        password: values.password,
      });

      const { accessToken, refreshToken, userId, role } = response.data.data;

      // Kiểm tra quyền (Logic cũ của bạn)
      if (role === "USER") {
        message.error("Bạn không có quyền truy cập trang quản trị!");
        return;
      }

      message.success("Đăng nhập thành công!");
      login(accessToken, refreshToken, userId, role, values.username);
      navigate("/");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: token.colorBgLayout, // Màu nền tự động đổi theo theme (Xám nhạt / Đen)
        backgroundImage:
          "linear-gradient(135deg, rgba(24,144,255,0.1) 0%, rgba(24,144,255,0) 100%)", // Hiệu ứng nền nhẹ
      }}
    >
      <Card
        bordered={false}
        style={{
          width: 400,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)", // Đổ bóng nhẹ
          borderRadius: token.borderRadiusLG,
        }}
      >
        {/* Logo / Header */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <img
            src="/image.png"
            alt="Logo"
            style={{ height: 60, marginBottom: 16 }}
          />
          <Title level={3} style={{ color: token.colorPrimary, margin: 0 }}>
            VNUA Manager
          </Title>
          <Text type="secondary">Đăng nhập hệ thống quản trị</Text>
        </div>

        {/* Form Đăng nhập */}
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Tên đăng nhập"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              block
              loading={loading}
              icon={<LoginOutlined />}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
