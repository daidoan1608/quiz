import { message, Button, Form, Input, List, Spin, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Account.css";
import { authAxios } from "../../api/axiosConfig";
import { useAuth } from "../Context/AuthProvider";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

// Hàm chuyển file thành base64 để preview
const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
};

// Kiểm tra file trước khi upload
const beforeUpload = file => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('Chỉ được upload file JPG/PNG!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Ảnh phải nhỏ hơn 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

const AccountInfo = ({ user, onChangePassword, onUploadAvatar }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(user?.avatarUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp" ); // Khởi tạo với avatar từ server

  const handleChange = info => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done' || !info.file.status) { // Xử lý cả khi không dùng action
      getBase64(info.file.originFileObj, url => {
        setLoading(false);
        setImageUrl(url);
        onUploadAvatar(info); // Gọi hàm upload lên server
      });
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Tải lên</div>
    </button>
  );

  if (!user) {
    return <div>Đang tải thông tin người dùng...</div>; // Thông báo khi dữ liệu chưa được tải xong
  }

  return (
    <div className="account-info">
      <Upload
        name="avatar"
        listType="picture-circle" // Hiển thị khung tròn
        className="avatar-uploader"
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        customRequest={({ file, onSuccess }) => {
          // Gửi file lên server trong onUploadAvatar, gọi onSuccess để bỏ qua action mặc định
          setTimeout(() => onSuccess("ok"), 0);
        }}
      >
        {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
      </Upload>
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
};

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
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("userId");
      try {
        setLoading(true);
        const [userResponse, examsResponse] = await Promise.all([
          authAxios.get(`user/${userId}`),
          authAxios.get(`user/userexams/user/${userId}`)
        ]);
        setUser(userResponse.data.data);
        setExams(examsResponse.data.data);
      } catch (error) {
        message.error("Lỗi khi lấy thông tin người dùng hoặc bài thi!");
      } finally {
        setLoading(false);
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

  const handleUploadAvatar = async (info) => {
    const file = info.file;
    const userId = localStorage.getItem("userId");
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading(true);
      const response = await authAxios.post(`/upload-avatar/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = { ...user, avatarUrl: response.data.avatarUrl };
      setUser(updatedUser);
      message.success("Tải lên avatar thành công!");
    } catch (error) {
      message.error("Tải lên avatar thất bại!");
    } finally {
      setLoading(false);
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
      <div className="account-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="account-container">
        <AccountInfo
          user={user}
          onChangePassword={() => setShowChangePassword(true)}
          onUploadAvatar={handleUploadAvatar}
        />
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
    </div>
  );
};

export default Account;