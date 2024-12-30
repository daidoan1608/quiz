import { message, Button, Form, Input, List, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../account/account.css";
import { authAxios } from "../../api/axiosConfig";
import Headers from "../Headers";
import Footer from "../Footer";
import { useAuth } from "../Context/AuthProvider";

const AccountInfo = ({ user, onChangePassword }) => (
  <div className="account-info">
    <img
      src="https://via.placeholder.com/120"
      alt="Avatar"
      className="avatar"
    />
    <h2>Thông tin người dùng</h2>
    <div className="account-details">
      <p><strong>Tên người dùng:</strong> {user.username}</p>
      <p><strong>Họ và tên:</strong> {user.fullName}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Vai trò:</strong> {user.role}</p>
    </div>
    <Button
      onClick={onChangePassword}
      type="primary"
      danger
      className="change-password-btn"
    >
      Đổi mật khẩu
    </Button>
  </div>
);

const ChangePasswordForm = ({ onCancel, onSubmit }) => (
  <div className="change-password-form">
    <h3>Đổi mật khẩu</h3>
    <Form onFinish={onSubmit} layout="vertical">
      <Form.Item
        name="oldPassword"
        label="Mật khẩu cũ"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
      >
        <Input.Password placeholder="Mật khẩu cũ" size="large" />
      </Form.Item>

      <Form.Item
        name="newPassword"
        label="Mật khẩu mới"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }, { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" }]}
      >
        <Input.Password placeholder="Mật khẩu mới" size="large" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Xác nhận mật khẩu mới"
        dependencies={["newPassword"]}
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
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
        <Input.Password placeholder="Xác nhận mật khẩu mới" size="large" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Xác nhận đổi mật khẩu
        </Button>
        <Button
          type="default"
          block
          onClick={onCancel}
          style={{ marginTop: 10 }}
        >
          Hủy
        </Button>
      </Form.Item>
    </Form>
  </div>
);

const Account = () => {
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(true); // Thêm loading
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("userId");
      try {
        setLoading(true); // Bắt đầu loading
        const [userResponse, examsResponse] = await Promise.all([
          authAxios.get(`/${userId}`),
          authAxios.get(`/userexams/user/${userId}`)
        ]);

        setUser(userResponse.data);
        setExams(examsResponse.data);
      } catch (error) {
        message.error("Lỗi khi lấy thông tin người dùng hoặc bài thi!");
      } finally {
        setLoading(false); // Dừng loading
      }
    };

    fetchData();
  }, []);

  const handleChangePassword = async (values) => {
    const userId = localStorage.getItem("userId");
    try {
      const response = await authAxios.post(`auth/change-password/${userId}`, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      if (response.data === "Mật khẩu không đúng") {
        message.error("Mật khẩu cũ không đúng!");
        return;
      }

      message.success("Đổi mật khẩu thành công!");
      setShowChangePassword(false);
      logout();
      navigate("/login");
    } catch (error) {
      message.error("Đổi mật khẩu thất bại. Vui lòng thử lại!");
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

  if (loading) {
    return (
      <div>
        <Headers />
        <div className="account-container">
          <Spin size="large" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Headers />
      <div className="account-container">
        <AccountInfo user={user} onChangePassword={() => setShowChangePassword(true)} />
        {showChangePassword && (
          <>
            <div className="overlay" onClick={() => setShowChangePassword(false)} />
            <ChangePasswordForm
              onSubmit={handleChangePassword}
              onCancel={() => setShowChangePassword(false)}
            />
          </>
        )}
      </div>

      <div className="exam-list">
        <h3>Bài thi của bạn</h3>
        <List
          dataSource={exams}
          renderItem={(test) => (
            <List.Item className="exam-item">
              <div className="exam-details">
                <p className="subject-name">{test.subjectName}</p>
                <p className="exam-title">{test.title}</p>
                <p className="exam-score">
                  Điểm: {(test.userExamDto.score || 0).toFixed(2)}
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
