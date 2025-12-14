import React, { useState, useEffect } from "react";
import {
  LockOutlined,
  UserOutlined,
  GoogleOutlined,
  FacebookOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { publicAxios } from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthProvider";
import { authAxios } from "../../api/axiosConfig";

function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // State 'remember' chỉ để trigger re-render nếu cần, logic chính nằm ở Form Antd
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem("savedUsername");
    const savedPassword = localStorage.getItem("savedPassword");
    if (savedUsername && savedPassword) {
      form.setFieldsValue({
        username: savedUsername,
        password: savedPassword,
        remember: true,
      });
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
      const avatarResponse = await authAxios.get("users/me/avatar");
      const avatar = avatarResponse.data.data;
      if (values.remember) {
        localStorage.setItem("savedUsername", values.username);
        localStorage.setItem("savedPassword", values.password);
        localStorage.setItem("fullName", fullName);
        localStorage.setItem("avatarUrl", avatar);
      } else {
        localStorage.removeItem("savedUsername");
        localStorage.removeItem("savedPassword");
        localStorage.removeItem("fullName");
        localStorage.removeItem("avatarUrl");
      }

      login(accessToken, refreshToken, userId, fullName, avatarUrl);
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
      const { accessToken, refreshToken, userId } = response.data;
      login(accessToken, refreshToken, userId);
      navigate("/");
    } catch (error) {
      message.error(`Đăng nhập bằng ${provider} thất bại!`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-[url('https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg')] bg-no-repeat bg-center bg-cover py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        {/* Header Section */}
        <div className="text-center">
          <img
            src="/logoschool.png"
            alt="Logo"
            className="mx-auto h-16 w-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          />
          <h2 className="text-3xl font-extrabold text-blue-600 tracking-tight">
            ĐĂNG NHẬP
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Chào mừng bạn quay trở lại!
          </p>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          initialValues={{ remember: false }}
          layout="vertical"
          className="mt-8 space-y-6"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
            className="mb-4"
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Tên đăng nhập"
              className="rounded-lg py-2.5"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            className="mb-4"
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Mật khẩu"
              className="rounded-lg py-2.5"
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" className="mb-4">
            <div className="flex items-center justify-between">
              <Checkbox
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="text-gray-600"
              >
                Ghi nhớ đăng nhập
              </Checkbox>
              <a
                href="/forgot"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot");
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
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
              className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-lg shadow-md transition-all duration-300 border-none"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        {/* OAuth Section */}
        <div>
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Hoặc đăng nhập với
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <Button
              shape="circle"
              icon={<GoogleOutlined className="text-xl text-red-500" />}
              onClick={() => handleOAuthLogin("google")}
              className="flex items-center justify-center w-12 h-12 border border-gray-300 hover:bg-gray-50 transition-colors"
            />
            <Button
              shape="circle"
              icon={<FacebookOutlined className="text-xl text-blue-600" />}
              onClick={() => handleOAuthLogin("facebook")}
              className="flex items-center justify-center w-12 h-12 border border-gray-300 hover:bg-gray-50 transition-colors"
            />
            <Button
              shape="circle"
              icon={<GithubOutlined className="text-xl text-gray-800" />}
              onClick={() => handleOAuthLogin("github")}
              className="flex items-center justify-center w-12 h-12 border border-gray-300 hover:bg-gray-50 transition-colors"
            />
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <span className="text-gray-600">Chưa có tài khoản? </span>
          <a
            href="/register"
            onClick={(e) => {
              e.preventDefault();
              navigate("/register");
            }}
            className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors"
          >
            Đăng ký ngay
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
