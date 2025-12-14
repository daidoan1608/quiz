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
      const response = await publicAxios.post("/auth/register", {
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      });

      // Nếu API trả về thành công (thường là status 200 hoặc 201)
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error) {
      // Xử lý lỗi từ server trả về
      const errorMessage =
        error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
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
            ĐĂNG KÝ TÀI KHOẢN
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Tạo tài khoản để bắt đầu hành trình học tập
          </p>
        </div>

        <Form
          form={form}
          name="register"
          autoComplete="off"
          layout="vertical"
          onFinish={onFinish}
          className="mt-8 space-y-5"
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
              placeholder="Tên đăng nhập"
              prefix={<UserOutlined className="text-gray-400" />}
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
              prefix={<UserOutlined className="text-gray-400" />}
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
              prefix={<MailOutlined className="text-gray-400" />}
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
              prefix={<LockOutlined className="text-gray-400" />}
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
              prefix={<LockOutlined className="text-gray-400" />}
              className="rounded-lg py-2.5"
            />
          </Form.Item>

          <Form.Item>
            <Button
              block
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-lg shadow-md transition-all duration-300 border-none"
            >
              Đăng ký ngay
            </Button>
          </Form.Item>
        </Form>

        {/* Footer Link */}
        <div className="text-center mt-6 pt-4 border-t border-gray-100">
          <span className="text-gray-600">Đã có tài khoản? </span>
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
            className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors"
          >
            Đăng nhập ngay
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
