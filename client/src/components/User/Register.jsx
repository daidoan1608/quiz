import React, { useState } from "react";
import { Button, Form, Input, message } from "antd";
import { LockOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { publicAxios } from "../../api/axiosConfig";

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Gọi API đăng ký
      await publicAxios.post("/auth/register", {
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      });

      message.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.", 6);
      form.resetFields();
    } catch (error) {
      // Xử lý lỗi từ server trả về
      const serverMessage = error.response?.data?.message;
      const validationErrors = error.response?.data?.errors;
      const errorMessage =
        Array.isArray(validationErrors) && validationErrors.length > 0
          ? validationErrors.join(". ")
          : serverMessage === "Username is already existed"
            ? "Tên đăng nhập đã tồn tại!"
            : serverMessage === "Email is already existed"
              ? "Email đã tồn tại!"
              : serverMessage || "Đăng ký thất bại. Vui lòng thử lại!";
      message.error(errorMessage);
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
            ĐĂNG KÝ TÀI KHOẢN
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--aura-subtle)" }}>
            Tạo tài khoản để bắt đầu hành trình học tập
          </p>
        </div>

        <Form
          form={form}
          name="register"
          autoComplete="off"
          layout="vertical"
          onFinish={onFinish}
          className="auth-form mt-8 space-y-5"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" },
              { max: 20, message: "Tên đăng nhập không được quá 20 ký tự!" },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới!",
              },
            ]}
            className="mb-4"
          >
            <Input
              placeholder="Tên đăng nhập"
              prefix={<UserOutlined className="auth-input-icon" />}
              className="rounded-lg py-2.5"
            />
          </Form.Item>

          <Form.Item
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
            className="mb-4"
          >
            <Input
              placeholder="Họ và tên"
              prefix={<UserOutlined className="auth-input-icon" />}
              className="rounded-lg py-2.5"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
            className="mb-4"
          >
            <Input
              placeholder="Email"
              prefix={<MailOutlined className="auth-input-icon" />}
              className="rounded-lg py-2.5"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
            ]}
            className="mb-4"
          >
            <Input.Password
              placeholder="Mật khẩu"
              prefix={<LockOutlined className="auth-input-icon" />}
              className="rounded-lg py-2.5"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword" // Đổi tên thành confirmPassword cho rõ nghĩa (giống logic cũ là password2)
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
            className="mb-6"
          >
            <Input.Password
              placeholder="Xác nhận mật khẩu"
              prefix={<LockOutlined className="auth-input-icon" />}
              className="rounded-lg py-2.5"
            />
          </Form.Item>

          <Form.Item>
            <Button
              block
              type="primary"
              htmlType="submit"
              loading={loading}
              className="auth-primary-btn w-full h-12 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 border-none"
            >
              Đăng ký ngay
            </Button>
          </Form.Item>
        </Form>

        {/* Footer Link */}
        <div className="auth-footer text-center mt-6 pt-4">
          <span style={{ color: "var(--aura-muted)" }}>Đã có tài khoản? </span>
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
            className="auth-link font-medium hover:underline transition-colors"
          >
            Đăng nhập ngay
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
