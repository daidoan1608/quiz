import React, { useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { publicAxios } from "../../api/axiosConfig";
import "./Login.css";
import { useAuth } from "../Context/AuthProvider";

function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Lấy hàm login từ context
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await publicAxios.post("/auth/login", {
        username: values.username,
        password: values.password,
      });

      const { accessToken, refreshToken, userId } = response.data;
      login(accessToken, refreshToken, userId);
      navigate("/");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="form-login">
        <div className="logo-container">
          <img src="/logoschool.png" alt="Logo" className="logo-form" />
          <h2 className="login-title">ĐĂNG NHẬP</h2>
        </div>

        <Form
          name="login"
          onFinish={handleSubmit}
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="input-icon" />}
              placeholder="Tên đăng nhập"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="Mật khẩu"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <div className="checkbox-container">
              <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              <a href="/forgot" className="forgot-password">
                Quên mật khẩu?
              </a>
            </div>
          </Form.Item>
          <Form.Item>
            <Button
              block
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="submit-button"
            >
              Đăng nhập
            </Button>
            <div className="register-link">
              hoặc{" "}
              <a href="/register" className="register">
                Đăng ký ngay!
              </a>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Login;
