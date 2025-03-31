import React, { useState } from "react";
import { MailOutlined, LockOutlined, NumberOutlined } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { publicAxios } from "../../api/axiosConfig";

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleEmailSubmit = async (values) => {
    setLoading(true);
    try {
      await publicAxios.post("/auth/forgot-password", {
        email: values.email,
      });
      setEmail(values.email);
      setEmailVerified(true);
      message.success("Email hợp lệ, vui lòng nhập mã OTP và mật khẩu mới");
    } catch (error) {
      const errorMessage =
        error.response?.data || "Có lỗi xảy ra, vui lòng thử lại!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      await publicAxios.post("/auth/reset-password", {
        email,
        otp: values.otp,
        newPassword: values.password,
      });
      message.success("Đổi mật khẩu thành công!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      const errorMessage =
        error.response?.data || "Có lỗi xảy ra, vui lòng thử lại!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="form-forgot-password">
        <h2 className="forgot-password-title">{emailVerified ? "Đặt Lại Mật Khẩu" : "Quên Mật Khẩu"}</h2>
        {emailVerified ? (
          <Form name="reset-password" onFinish={handleResetPassword}>
            <Form.Item
              name="otp"
              rules={[{ required: true, message: "Vui lòng nhập mã OTP!" }]}
            >
              <Input
                prefix={<NumberOutlined className="input-icon" />}
                placeholder="Nhập mã OTP"
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="Nhập mật khẩu mới"
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
                Đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form name="forgot-password" onFinish={handleEmailSubmit}>
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Vui lòng nhập email!" }]}
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
                Gửi yêu cầu
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
