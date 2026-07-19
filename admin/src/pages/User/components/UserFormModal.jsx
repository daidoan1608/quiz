import React from "react";
import {
  Alert,
  Button,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import {
  EditOutlined,
  LockOutlined,
  MailOutlined,
  SaveOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  cancelModalButtonStyle,
  primaryModalButtonStyle,
} from "../../../utils/ui/antdModalButtonStyles";
import { USER_FORM_INITIAL_VALUES, USER_ROLE_OPTIONS } from "../constants";
import { useUserForm } from "../hooks/useUserForm";

const { Title, Text } = Typography;

export const UserFormModal = ({
  mode,
  userId,
  open,
  onCancel,
  onSuccess,
}) => {
  const {
    form,
    loading,
    submitting,
    originalRole,
    isEditMode,
    isEditingSelf,
    submit,
    cancel,
  } = useUserForm({
    mode,
    userId,
    open,
    onCancel,
    onSuccess,
  });

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {isEditMode ? (
            <>
              <EditOutlined style={{ marginRight: 8 }} /> Cập nhật người dùng
            </>
          ) : (
            <>
              <UserAddOutlined style={{ marginRight: 8 }} /> Thêm người dùng mới
            </>
          )}
        </Title>
      }
      open={open}
      onCancel={cancel}
      footer={isEditMode ? null : [
        <Button key="back" style={cancelModalButtonStyle} onClick={cancel}>
          Hủy bỏ
        </Button>,
        <Button
          key="submit"
          type="default"
          style={primaryModalButtonStyle}
          icon={<SaveOutlined />}
          loading={submitting}
          onClick={() => form.submit()}
        >
          Lưu người dùng
        </Button>,
      ]}
      width={isEditMode ? 720 : 700}
      centered
      maskClosable={!loading}
      confirmLoading={loading}
    >
      <Divider style={{ margin: "16px 0" }} />
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Text type="secondary">Đang tải dữ liệu...</Text>
        </div>
      ) : (
        <>
          {isEditMode && isEditingSelf && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message="Tài khoản hiện tại"
              description="Bạn không thể tự thay đổi vai trò của chính mình để tránh mất quyền quản trị."
            />
          )}

          {isEditMode && originalRole === "ADMIN" && !isEditingSelf && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message="Tài khoản ADMIN"
              description="Backend sẽ không cho hạ quyền nếu đây là ADMIN cuối cùng của hệ thống."
            />
          )}

          {isEditMode && originalRole === "MOD" && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message="Tài khoản MOD"
              description="Nếu đổi sang USER hoặc ADMIN, các quyền theo môn sẽ bị backend thu hồi."
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={submit}
            initialValues={USER_FORM_INITIAL_VALUES}
            size="large"
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                {!isEditMode && (
                  <Form.Item
                    label="Tên tài khoản (Username)"
                    name="username"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên tài khoản!" },
                      {
                        min: 4,
                        message: "Tên tài khoản phải từ 4 ký tự trở lên",
                      },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Ví dụ: student123" />
                  </Form.Item>
                )}

                <Form.Item
                  label="Họ và tên"
                  name="fullName"
                  rules={
                    isEditMode
                      ? undefined
                      : [{ required: true, message: "Vui lòng nhập họ tên!" }]
                  }
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    disabled={isEditMode}
                  />
                </Form.Item>

                {!isEditMode && (
                  <Form.Item
                    label="Vai trò (Role)"
                    name="role"
                    rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
                  >
                    <Select placeholder="Chọn vai trò" options={USER_ROLE_OPTIONS} />
                  </Form.Item>
                )}
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={
                    isEditMode
                      ? undefined
                      : [
                          { required: true, message: "Vui lòng nhập email!" },
                          { type: "email", message: "Email không hợp lệ!" },
                        ]
                  }
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="example@vnua.edu.vn"
                    disabled={isEditMode}
                  />
                </Form.Item>

                {isEditMode ? (
                  <>
                    <Form.Item
                      label="Vai trò"
                      name="role"
                      rules={[{ required: true, message: "Chọn vai trò" }]}
                    >
                      <Select disabled={isEditingSelf}>
                        <Select.Option value="USER">USER</Select.Option>
                        <Select.Option value="MOD">MOD</Select.Option>
                        <Select.Option value="ADMIN">ADMIN</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item label="Hành động">
                      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                        <Button style={cancelModalButtonStyle} onClick={cancel}>
                          Hủy
                        </Button>
                        <Button
                          type="default"
                          style={primaryModalButtonStyle}
                          htmlType="submit"
                          icon={<SaveOutlined />}
                          loading={submitting}
                        >
                          Lưu vai trò
                        </Button>
                      </Space>
                    </Form.Item>
                  </>
                ) : (
                  <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu!" },
                      {
                        min: 6,
                        message: "Mật khẩu phải từ 6 ký tự trở lên",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Nhập mật khẩu mạnh"
                    />
                  </Form.Item>
                )}
              </Col>
            </Row>
          </Form>
        </>
      )}
    </Modal>
  );
};
