import React, { useState } from "react";
import { Button, Form, Input, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { publicAxios } from "../../api/axiosConfig";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP, 3: Đặt lại mật khẩu
  const [email, setEmail] = useState(""); // Lưu email để dùng ở các bước sau
  const [token, setToken] = useState(""); // Lưu email để dùng ở các bước sau
  const navigate = useNavigate();

  // Bước 1: Gửi yêu cầu OTP qua email
  const handleSendOtp = async (values) => {
    setLoading(true);
    try {
      const response = await publicAxios.post("otp/send", {
        email: values.email,
      });
      if (response.status === 200) {
        message.success("OTP đã được gửi đến email của bạn! Vui lòng kiểm tra.", 3);
        setEmail(values.email); // Lưu email
        setStep(2); // Chuyển sang bước nhập OTP
      }
    } catch (error) {
      const errorMessage =
        error.response?.status === 404
          ? "Email này chưa được đăng ký!"
          : error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!";
      message.error(errorMessage, 3);
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác nhận OTP
  const handleVerifyOtp = async (values) => {
    setLoading(true);
    try {
      const response = await publicAxios.post("otp/verify", {
        email: email,
        otp: values.otp,
      });
      if (response.status === 200) {
        message.success("Xác nhận OTP thành công!", 3);
        setToken(values.resetToken); // Lưu token
        setStep(3); // Chuyển sang bước đặt lại mật khẩu
      }
    } catch (error) {
      message.error("OTP không hợp lệ hoặc đã hết hạn!", 3);
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Đặt lại mật khẩu
  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      const response = await publicAxios.post("otp/reset", {
        resetToken: token,
        newPassword: values.password,
      });
      if (response.status === 200) {
        message.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.", 3);
        navigate("/login");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại!", 3);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="form-forgot-password">
        <div className="logo-container">
          <img src="/logoschool.png" alt="Logo" className="logo-form" />
          <h2 className="forgot-password-title">QUÊN MẬT KHẨU</h2>
        </div>

        {/* Bước 1: Form nhập email */}
        {step === 1 && (
          <Form form={form} name="send-otp" layout="vertical" onFinish={handleSendOtp}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="input-icon" />}
                placeholder="Nhập email của bạn"
                size="large"
              />
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
                Gửi OTP
              </Button>
            </Form.Item>
            <div className="login-link">
              Quay lại{" "}
              <span
                className="login"
                onClick={() => navigate("/login")}
                style={{ cursor: "pointer", color: "#1890ff" }}
              >
                Đăng nhập
              </span>
            </div>
          </Form>
        )}

        {/* Bước 2: Form nhập OTP */}
        {step === 2 && (
          <Form form={form} name="verify-otp" layout="vertical" onFinish={handleVerifyOtp}>
            <Form.Item
              label="Mã OTP"
              name="otp"
              rules={[
                { required: true, message: "Vui lòng nhập mã OTP!" },
                { len: 6, message: "OTP phải có 6 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập mã OTP từ email" size="large" />
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
                Xác nhận OTP
              </Button>
            </Form.Item>
            <div className="login-link">
              <span
                onClick={() => setStep(1)}
                style={{ cursor: "pointer", color: "#1890ff" }}
              >
                Nhập lại email
              </span>
            </div>
            <div className="login-link">
              Hoặc quay lại{" "}
              <span
                className="login"
                onClick={() => navigate("/login")}
                style={{ cursor: "pointer", color: "#1890ff" }}
              >
                Đăng nhập
              </span>
            </div>
          </Form>
        )}

        {/* Bước 3: Form đặt lại mật khẩu */}
        {step === 3 && (
          <Form form={form} name="reset-password" layout="vertical" onFinish={handleResetPassword}>
            <Form.Item
              label="Mật khẩu mới"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu mới" size="large" />
            </Form.Item>
            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Xác nhận mật khẩu" size="large" />
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
                Đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;