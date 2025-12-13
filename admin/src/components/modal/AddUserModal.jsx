import React, { useState } from "react";
import {
  Form, Input, Button, Modal, Select, message,
  Row, Col, Typography, Divider,
} from "antd";
import { UserOutlined, MailOutlined, LockOutlined, SaveOutlined, UserAddOutlined } from "@ant-design/icons";
import { authAxios } from "../../api/axiosConfig"; // Điều chỉnh đường dẫn nếu cần

const { Title } = Typography;
const { Option } = Select;

const AddUserModal = ({ isModalOpen, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authAxios.post("/admin/add/users", values);
      message.success("Thêm người dùng thành công!");
      form.resetFields();
      onSuccess(); // Gọi hàm để đóng modal và làm mới dữ liệu
    } catch (error) {
      console.error("Lỗi:", error);
      message.error(
        error.response?.data?.message || "Không thể thêm người dùng! Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <UserAddOutlined style={{ marginRight: 8 }} /> Thêm người dùng mới
        </Title>
      }
      open={isModalOpen}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={[
        <Button key="back" onClick={onCancel}>Hủy bỏ</Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={() => form.submit()}
        >
          Lưu người dùng
        </Button>,
      ]}
      width={700}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ role: "USER" }} // Giá trị mặc định
        size="large"
      >
        <Divider style={{ margin: '16px 0' }} />
        <Row gutter={24}>
          <Col xs={24} md={12}>
            {/* Tên tài khoản */}
            <Form.Item
              label="Tên tài khoản (Username)"
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên tài khoản!" },
                { min: 4, message: "Tên tài khoản phải từ 4 ký tự trở lên" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Ví dụ: student123" />
            </Form.Item>

            {/* Họ và tên */}
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn A" />
            </Form.Item>

            {/* Vai trò */}
            <Form.Item
              label="Vai trò (Role)"
              name="role"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            >
              <Select placeholder="Chọn vai trò">
                <Option value="USER">USER (Người dùng thường)</Option>
                <Option value="MOD">MOD (Quản trị viên bộ môn)</Option>
                <Option value="ADMIN">ADMIN (Quản trị viên hệ thống)</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            {/* Email */}
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="example@vnua.edu.vn" />
            </Form.Item>

            {/* Mật khẩu */}
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu phải từ 6 ký tự trở lên" },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mạnh" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddUserModal;