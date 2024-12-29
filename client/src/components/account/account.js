import React, { useEffect, useState } from "react";
import { message, Button, Form, Input ,List } from "antd";
import { useNavigate } from "react-router-dom";
import "./Account.css";
import { authAxios } from "../../api/axiosConfig";
import Headers from "../Headers";
import Footer from "../Footer";
import { useAuth } from "../Context/AuthProvider";

const Account = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [exams, setExams] = useState([]);  // Dùng state để lưu các bài thi
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      try {
        const response = await authAxios.get(`/${userId}`);
        if (mounted) {
          setUser(response.data);
          setIsLoading(false);
        }
      } catch (error) {
        if (mounted) {
          message.error("Lỗi khi lấy thông tin người dùng!");
          setIsLoading(false);
        }
      }
    };
    const fetchUserTests = async () => {
      const userId = localStorage.getItem('userId');
      try {
        const response = await authAxios.get(`/userexams/user/${userId}`);
        if (mounted) {
          setExams(response.data);  // Lưu danh sách bài thi vào state
        }
      } catch (error) {
        
      }
    };

    fetchUserData();
    fetchUserTests();

    return () => {
      mounted = false;
    };
  }, [isLoading, navigate]);

  const handleChangePassword = async (values) => {
    const userId = localStorage.getItem("userId");
    try {
      // Gửi yêu cầu đổi mật khẩu
      const response = await authAxios.post(`auth/change-password/${userId}`, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      if (response.data === "Mật khẩu không đúng") {
        message.error("Mật khẩu cũ không đúng!");
        return;
      }

      message.success("Đổi mật khẩu thành công!");
      setShowChangePassword(false); // Đóng form đổi mật khẩu
      logout(); // Đăng xuất người dùng
      navigate("/login");
    } catch (error) {
      message.error("Đổi mật khẩu thất bại. Vui lòng thử lại!");
      console.log(error);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading || !user) {
    return (
      <div>
        <Headers />
        <div className="account-container">
          <div className="account-info">
            <h2>Đang tải thông tin...</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Headers />
      <div className="account-container">
        <div
          className={`account-info ${
            showChangePassword ? "account-info-hidden" : ""
          }`}
        >
          <img
            src="https://via.placeholder.com/120"
            alt="Avatar"
            className="avatar"
          />
          <h2>Thông tin người dùng</h2>
          <div className="account-details">
            <p>
              <strong>Tên người dùng:</strong> {user.username}
            </p>
            <p>
              <strong>Họ và tên:</strong> {user.fullName}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Vai trò:</strong> {user.role}
            </p>
          </div>
          <Button
            onClick={() => setShowChangePassword(true)}
            type="primary"
            danger
            className="change-password-btn"
          >
            Đổi mật khẩu
          </Button>
        </div>

        {/* Màn mờ nền khi form đổi mật khẩu hiển thị */}
        {showChangePassword && (
          <div
            className="overlay"
            onClick={() => setShowChangePassword(false)}
          />
        )}

        {/* Form đổi mật khẩu */}
        {showChangePassword && (
          <>
            {/* Overlay chỉ che phần nền */}
            <div
              className="overlay"
              onClick={() => setShowChangePassword(false)}
            />

            {/* Form đổi mật khẩu hiển thị rõ ràng */}
            <div className="change-password-form">
              <h3>Đổi mật khẩu</h3>
              <Form onFinish={handleChangePassword} layout="vertical">
                <Form.Item
                  name="oldPassword"
                  label="Mật khẩu cũ"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu cũ!" },
                  ]}
                >
                  <Input.Password placeholder="Mật khẩu cũ" size="large" />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="Mật khẩu mới"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                    { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                  ]}
                >
                  <Input.Password placeholder="Mật khẩu mới" size="large" />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu mới"
                  dependencies={["newPassword"]}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng xác nhận mật khẩu mới!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject("Mật khẩu xác nhận không khớp!");
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    placeholder="Xác nhận mật khẩu mới"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    Xác nhận đổi mật khẩu
                  </Button>
                  <Button
                    type="default"
                    block
                    onClick={() => setShowChangePassword(false)}
                    style={{ marginTop: 10 }}
                  >
                    Hủy
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </>
        )}
      </div>
      {/* Hiển thị các bài thi của người dùng */}
      
<div className="exam-list">
  <h3>Bài thi của bạn</h3>
  <List
    dataSource={exams}
    renderItem={test => (
      <List.Item className="exam-item">
        <div className="exam-details">
          <p className="subject-name">{test.subjectName}</p>
          <p className="exam-title">{test.title}</p>
          <p className="exam-score">
            Điểm: {test.userExamDto.score ? test.userExamDto.score : '0'}
          </p>
          <p className="exam-time">
            Thời gian: {formatDateTime(test.userExamDto.startTime)} - {formatDateTime(test.userExamDto.endTime)}
          </p>
        </div>
      </List.Item>
    )}
  />
</div>
      <Footer />
    </div>
  );
};

export default Account;