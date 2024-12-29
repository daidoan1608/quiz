import React from "react";
import { Button, Form, Input, message } from "antd";
import { LockOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { publicAxios } from "../../api/axiosConfig";
import { useAuth } from "../Context/AuthProvider";
import "./Register.css"; // Importing the CSS file

const RegisterForm = ({ setShowRegister }) => { // Nhận setShowRegister từ App.js
  const { login } = useAuth();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await publicAxios.post("/auth/register", {
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      });

      const { accessToken, refreshToken, userId } = response.data;
      login(accessToken, refreshToken, userId);

      message.success("Đăng ký thành công! Chuyển đến trang chủ");
      navigate("/");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!";
      message.error(errorMessage);
    }
  };

  return (
    <div className="register-container">
      <div className="form-register">
        <div className="logo-container">
          <img src="/logoschool.png" alt="Logo" className="logo-form" />
          <h2 className="register-title">ĐĂNG KÝ</h2>
        </div>

        <Form
          form={form}
          name="register"
          autoComplete="off"
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Tên người dùng"
            name="username"
            rules={[{ required: true, message: "Vui lòng nhập Username!" }]}
          >
            <Input
              placeholder="Nhập username"
              prefix={<UserOutlined className="input-icon" />}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input 
              placeholder="Nhập họ và tên" 
              prefix={<UserOutlined className="input-icon" />}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input 
              placeholder="Nhập email" 
              prefix={<MailOutlined className="input-icon" />}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
            ]}
          >
            <Input.Password 
              placeholder="Nhập mật khẩu" 
              prefix={<LockOutlined className="input-icon" />}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="password2"
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
          >
            <Input.Password 
              placeholder="Xác nhận mật khẩu" 
              prefix={<LockOutlined className="input-icon" />}
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: "10px" }}>
            <Button
              block
              type="primary"
              htmlType="submit"
              size="large"
              className="submit-button"
            >
              Đăng ký
            </Button>
          </Form.Item>

          <div className="login-link">
            Đã có tài khoản? <a href="/login" className="login">Đăng nhập ngay!</a>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default RegisterForm;
