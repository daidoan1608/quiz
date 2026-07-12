import React, { useEffect, useState } from "react";
import { Button, Result, Spin } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { publicAxios } from "../../api/axiosConfig";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Thiếu token xác thực email.");
      return;
    }

    const verify = async () => {
      try {
        await publicAxios.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        setStatus("success");
        setMessage("Email đã được xác thực thành công. Bạn có thể đăng nhập ngay.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Xác thực email thất bại hoặc liên kết đã hết hạn."
        );
      }
    };

    verify();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">Đang xác thực email...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <Result
          status={status === "success" ? "success" : "error"}
          title={status === "success" ? "Xác thực email thành công" : "Xác thực email thất bại"}
          subTitle={message}
          extra={[
            <Button type="primary" key="login" onClick={() => navigate("/login")}>
              Đi tới đăng nhập
            </Button>,
            <Button key="home" onClick={() => navigate("/")}>
              Về trang chủ
            </Button>,
          ]}
        />
      </div>
    </div>
  );
};

export default VerifyEmail;
