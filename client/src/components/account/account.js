import { message, Button, Form, Input, List, Spin, Upload, Collapse } from 'antd';
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAxios } from "../../api/axiosConfig";
import { useAuth } from "../Context/AuthProvider";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import './Account.css';
import ScoreChart from './ScoreChart';

const { Panel } = Collapse;

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
};

const beforeUpload = (file) => {
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
  const [imageUrl, setImageUrl] = useState(user?.avatarUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp");

  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      const uploadedFile = info.file.originFileObj;
      if (uploadedFile && uploadedFile !== imageUrl) {
        getBase64(uploadedFile, url => {
          setLoading(false);
          setImageUrl(url);
          onUploadAvatar(info);
        });
      } else {
        setLoading(false);
      }
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Tải lên</div>
    </button>
  );

  if (!user) return <div>Đang tải thông tin người dùng...</div>;

  return (
    <div className="account-info">
      <Upload
        name="avatar"
        listType="picture-circle"
        className="avatar-uploader"
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        customRequest={({ file, onSuccess }) => setTimeout(() => onSuccess("ok"), 0)}
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
      <Button onClick={onChangePassword} type="primary" danger className="change-password-btn">Đổi mật khẩu</Button>
    </div>
  );
};

const ChangePasswordForm = ({ onCancel, onSubmit }) => (
  <div className="change-password-form">
    <h3>Đổi mật khẩu</h3>
    <Form onFinish={onSubmit} layout="vertical">
      <Form.Item name="oldPassword" label="Mật khẩu cũ" rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}> <Input.Password placeholder="Mật khẩu cũ" size="large" /> </Form.Item>
      <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }, { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" }]}> <Input.Password placeholder="Mật khẩu mới" size="large" /> </Form.Item>
      <Form.Item name="confirmPassword" label="Xác nhận mật khẩu mới" dependencies={["newPassword"]} rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu mới!" }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue("newPassword") === value) return Promise.resolve(); return Promise.reject("Mật khẩu xác nhận không khớp!"); } })]}>
        <Input.Password placeholder="Xác nhận mật khẩu mới" size="large" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>Xác nhận đổi mật khẩu</Button>
        <Button type="default" block onClick={onCancel} style={{ marginTop: 10 }}>Hủy</Button>
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

  const handleError = (error) => {
    message.error(`Đã có lỗi xảy ra: ${error.message || error}`);
    console.error("Lỗi chi tiết:", error.response?.data || error);
  };

  const fetchData = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      message.error("Không tìm thấy userId. Vui lòng đăng nhập lại!");
      navigate("/login");
      return;
    }
    try {
      setLoading(true);
      const [userResponse, examsResponse] = await Promise.all([
        authAxios.get(`user/${userId}`),
        authAxios.get(`user/userexams/user/${userId}`)
      ]);

      const examData = examsResponse.data.data || [];
      const validatedExams = examData.map((exam) => {
        const userExamDto = exam.userExamDto || exam.userExam || {};
        const examId = exam.examId || exam.id || userExamDto.examId || null;
        return {
          ...exam,
          examId,
          userExamDto,
          subjectName: exam.subjectName || "Không xác định",
          title: exam.title || "Bài thi không tên",
        };
      });

      setUser(userResponse.data.data);
      setExams(validatedExams);
      if (!examData.length) message.info("Không có bài thi nào được tìm thấy.");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

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
      handleError(error);
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
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedUser = { ...user, avatarUrl: response.data.avatarUrl };
      setUser(updatedUser);
      message.success("Tải lên avatar thành công!");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "Chưa xác định";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleShowExamDetails = (exam) => {
    const examId = exam.examId || exam.id;
    const userExamId = exam.userExamDto?.userExamId || exam.userExamDto?.id || exam.userExam?.id;
    if (!examId || !userExamId) {
      message.error("Thông tin bài thi không hợp lệ!");
      return;
    }
    navigate('/detail', { state: { examId, userExamId } });
  };

  const groupedExams = useMemo(() => {
    if (!exams || !Array.isArray(exams)) {
      console.warn("Dữ liệu bài thi không hợp lệ hoặc rỗng");
      return {};
    }
    return exams.reduce((acc, exam) => {
      const subject = exam.subjectName || "Không xác định";
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push(exam);
      return acc;
    }, {});
  }, [exams]);

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
        <h3>Danh sách các môn đã thi</h3>
        {loading ? (
          <Spin size="large" />
        ) : Object.keys(groupedExams).length === 0 ? (
          <p>Không có bài thi nào để hiển thị.</p>
        ) : (
          <Collapse accordion>
            {Object.keys(groupedExams).map((subject, index) => (
              <Panel header={subject} key={index}>
                <ScoreChart data={groupedExams[subject]} />
                <List
                  dataSource={groupedExams[subject]}
                  renderItem={(test) => (
                    <List.Item className="exam-item">
                      <div className="exam-details">
                        <p className="exam-title">{test.title || "Bài thi không tên"}</p>
                        <p className="exam-score">Điểm: {(test.userExamDto.score || 0).toFixed(2)}</p>
                        {test.userExamDto.correctAnswers !== undefined && test.userExamDto.totalQuestions !== undefined && (
                          <p className="exam-result">
                            Câu đúng: {test.userExamDto.correctAnswers}/{test.userExamDto.totalQuestions}
                          </p>
                        )}
                        <p className="exam-time">
                          Thời gian: {formatDateTime(test.userExamDto.startTime)} - {formatDateTime(test.userExamDto.endTime)}
                        </p>
                      </div>
                      <Button type="link" onClick={() => handleShowExamDetails(test)} className='btn-detail'>Xem chi tiết</Button>
                    </List.Item>
                  )}
                />
              </Panel>
            ))}
          </Collapse>
        )}
      </div>
    </div>
  );
};

export default Account;