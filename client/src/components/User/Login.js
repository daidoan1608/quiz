import React, { useState, useEffect } from "react";
import { LockOutlined, UserOutlined, GoogleOutlined, FacebookOutlined, GithubOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { publicAxios } from "../../api/axiosConfig";
import "./Login.css";
import { useAuth } from "../Context/AuthProvider";

function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem("savedUsername");
    const savedPassword = localStorage.getItem("savedPassword");
    if (savedUsername && savedPassword) {
      form.setFieldsValue({
        username: savedUsername,
        password: savedPassword,
        remember: true });
      setRemember(true);
    }
  }, [form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await publicAxios.post("/auth/login", {
        username: values.username,
        password: values.password,
      });

      const { accessToken, refreshToken, userId, fullName, avatarUrl } = response.data.data;

      if (values.remember) {
        localStorage.setItem("savedUsername", values.username);
        localStorage.setItem("savedPassword", values.password);
        localStorage.setItem("fullName", fullName);
        localStorage.setItem("avatarUrl", avatarUrl);
      } else {
        localStorage.removeItem("savedUsername");
        localStorage.removeItem("savedPassword");
        localStorage.removeItem("fullName");
        localStorage.removeItem("avatarUrl");
      }

      login(accessToken, refreshToken, userId, fullName, avatarUrl);
      navigate("/");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      const response = await publicAxios.post(`/auth/${provider}`);
      const { accessToken, refreshToken, userId } = response.data;
      login(accessToken, refreshToken, userId);
      navigate("/");
    } catch (error) {
      message.error(`Đăng nhập bằng ${provider} thất bại!`);
    }
  };

  return (
    <div className="login-container">
      <div className="form-login">
        <div className="logo-container">
          <img
            src="/logoschool.png"
            alt="Logo"
            className="logo-form"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          />
          <h2 className="login-title">ĐĂNG NHẬP</h2>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          initialValues={{ remember: false }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
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
          <Form.Item name="remember" valuePropName="checked">
            <div className="checkbox-container">
              <Checkbox
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              >
                Ghi nhớ đăng nhập
              </Checkbox>
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
          </Form.Item>
        </Form>
        <div
          className="oauth-buttons"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <Button
            shape="circle"
            icon={<GoogleOutlined />}
            onClick={() => handleOAuthLogin("google")}
            className="oauth-icon"
          />
          <Button
            shape="circle"
            icon={<FacebookOutlined />}
            onClick={() => handleOAuthLogin("facebook")}
            className="oauth-icon facebook"
          />
          <Button
            shape="circle"
            icon={<GithubOutlined />}
            onClick={() => handleOAuthLogin("github")}
            className="oauth-icon github"
          />
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <span>Chưa có tài khoản? </span>
          <a href="/register" onClick={() => navigate("/register")}>
            Đăng ký
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;