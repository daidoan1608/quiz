import React, { useState, useEffect } from "react";
import {
  LockOutlined,
  UserOutlined,
  FacebookOutlined,
  GithubOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { publicAxios } from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthProvider";
import { authAxios } from "../../api/axiosConfig";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    const savedUsername = localStorage.getItem("savedUsername");
    if (savedUsername) {
      form.setFieldsValue({
        username: savedUsername,
        remember: true,
      });
    }
  }, [form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await publicAxios.post("/auth/login", {
        username: values.username,
        password: values.password,
      });

      const { userId, fullName, avatarUrl } = response.data.data;
      const avatarResponse = await authAxios.get("users/me/avatar");
      const avatar = avatarResponse.data.data;
      if (values.remember) {
        localStorage.setItem("savedUsername", values.username);
        localStorage.setItem("fullName", fullName);
        localStorage.setItem("avatarUrl", avatar);
      } else {
        localStorage.removeItem("savedUsername");
        localStorage.removeItem("fullName");
        localStorage.removeItem("avatarUrl");
      }

      login(userId, fullName, avatarUrl);
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

  const handleOAuthLogin = async (provider) => {
    try {
      // Lưu ý: Logic OAuth thường cần redirect sang trang của provider,
      // code này đang giả định luồng gọi API trực tiếp.
      const response = await publicAxios.post(`/auth/${provider}`);
      const { userId, fullName, avatarUrl } = response.data?.data || response.data;
      login(userId, fullName, avatarUrl);
      navigate("/");
    } catch (error) {
      message.error(`Đăng nhập bằng ${provider} thất bại!`);
    }
  };

  const handleGoogleLoginSuccess = async (idToken) => {
    setLoading(true);
    try {
      const response = await publicAxios.post("/auth/google", { idToken });
      const { userId, fullName, avatarUrl } = response.data.data;
      login(userId, fullName, avatarUrl);
      message.success("Đăng nhập Google thành công!");
      navigate("/");
    } catch (error) {
      console.error(error);
      message.error("Xác thực tài khoản Google thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="auth-card w-full max-w-md space-y-8 p-10 rounded-2xl shadow-xl">
        {/* Header Section */}
        <div className="text-center">
          <img
            src="/logoschool.png"
            alt="Logo"
            className="mx-auto h-16 w-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          />
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--aura-primary)" }}>
            ĐĂNG NHẬP
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--aura-subtle)" }}>
            Chào mừng bạn quay trở lại!
          </p>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          initialValues={{ remember: false }}
          layout="vertical"
          className="auth-form mt-8 space-y-6"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập hoặc email!" },
            ]}
            className="mb-4"
          >
            <Input
              prefix={<UserOutlined className="auth-input-icon" />}
              placeholder="Tên đăng nhập hoặc email"
              className="rounded-lg py-2.5"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            className="mb-4"
          >
            <Input.Password
              prefix={<LockOutlined className="auth-input-icon" />}
              placeholder="Mật khẩu"
              className="rounded-lg py-2.5"
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" className="mb-4">
            <div className="flex items-center justify-between">
              <Checkbox className="auth-checkbox">
                Ghi nhớ đăng nhập
              </Checkbox>
              <a
                href="/forgot"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot");
                }}
                className="auth-link text-sm font-medium hover:underline"
              >
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
              className="auth-primary-btn w-full h-12 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 border-none"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        {/* OAuth Section */}
        <div>
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full auth-divider-line"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="auth-divider-label px-2">
                Hoặc đăng nhập với
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <div className="social-login-btn google-login-btn relative overflow-hidden" aria-label="Đăng nhập với Google">
              <span className="google-login-fallback" aria-hidden="true">
                <GoogleOutlined />
              </span>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const idToken = credentialResponse.credential;
                  await handleGoogleLoginSuccess(idToken);
                }}
                onError={() => {
                  message.error("Đăng nhập Google thất bại!");
                }}
                useOneTap
                type="icon"
                shape="circle"
                size="large"
              />
            </div>
            <Button
              shape="circle"
              icon={<FacebookOutlined className="text-xl text-blue-600" />}
              onClick={() => handleOAuthLogin("facebook")}
              className="social-login-btn"
            />
            <Button
              shape="circle"
              icon={<GithubOutlined className="text-xl text-gray-800" />}
              onClick={() => handleOAuthLogin("github")}
              className="social-login-btn"
            />
          </div>
        </div>

        <style>{`
          .social-login-btn {
            width: 48px !important;
            min-width: 48px !important;
            height: 48px !important;
            padding: 0 !important;
            border-radius: 9999px !important;
            border: 1px solid var(--aura-border) !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: var(--aura-canvas) !important;
            color: var(--aura-text) !important;
            line-height: 1 !important;
            transition: background-color 0.2s ease, border-color 0.2s ease;
          }

          .social-login-btn:hover {
            background: var(--aura-primary-soft) !important;
            border-color: var(--aura-primary) !important;
          }

          .google-login-fallback {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            color: #ea4335;
            pointer-events: none;
            z-index: 1;
          }

          .social-login-btn iframe,
          .social-login-btn > div,
          .social-login-btn [role="button"] {
            width: 48px !important;
            min-width: 48px !important;
            max-width: 48px !important;
            height: 48px !important;
            border-radius: 9999px !important;
          }

          .google-login-btn iframe,
          .google-login-btn > div,
          .google-login-btn [role="button"] {
            opacity: 0 !important;
            position: relative !important;
            z-index: 2 !important;
          }
        `}</style>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <span style={{ color: "var(--aura-muted)" }}>Chưa có tài khoản? </span>
          <a
            href="/register"
            onClick={(e) => {
              e.preventDefault();
              navigate("/register");
            }}
            className="auth-link font-medium hover:underline transition-colors"
          >
            Đăng ký ngay
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
