import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Divider, Form, Input, Modal, Row, Select, Space, Typography, message } from "antd";
import { EditOutlined, MailOutlined, SaveOutlined, UserOutlined } from "@ant-design/icons";
import { authAxios } from "../../api/axiosConfig";

const { Title, Text } = Typography;
const { Option } = Select;

const primaryButtonStyle = {
  minHeight: 40,
  borderRadius: 10,
  borderColor: "var(--admin-primary)",
  background: "color-mix(in srgb, var(--admin-primary) 12%, transparent)",
  color: "var(--admin-primary)",
  boxShadow: "none",
};

const cancelButtonStyle = {
  minHeight: 40,
  borderRadius: 10,
  borderColor: "#ef4444",
  background: "rgba(239, 68, 68, 0.1)",
  color: "#ef4444",
};

const UpdateUserModal = ({ isModalOpen, onCancel, onSuccess, userId }) => {
  const [form] = Form.useForm();
  const [loadingUser, setLoadingUser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [originalRole, setOriginalRole] = useState("USER");
  const [permissionMap, setPermissionMap] = useState({});

  const fetchModPermissions = useCallback(async (modId) => {
    try {
      const response = await authAxios.get(`/admin/permissions/mod/${modId}`);
      setPermissionMap(response.data || {});
    } catch {
      setPermissionMap({});
    }
  }, []);

  useEffect(() => {
    if (!isModalOpen || !userId) return;

    const fetchUserDetails = async () => {
      setLoadingUser(true);
      try {
        const response = await authAxios.get(`users/${userId}`);
        const userData = response.data.data;
        const role = userData.role || "USER";

        form.setFieldsValue({
          fullName: userData.fullName,
          email: userData.email,
          role,
        });
        setOriginalRole(role);

        if (role === "MOD") {
          fetchModPermissions(userId);
        } else {
          setPermissionMap({});
        }
      } catch (error) {
        message.error("Không thể lấy thông tin người dùng.");
        onCancel();
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserDetails();
  }, [userId, isModalOpen, form, onCancel, fetchModPermissions]);

  const submitRoleUpdate = async (role) => {
    setSaving(true);
    try {
      await authAxios.patch(`/admin/permissions/user/${userId}/role`, { role });
      message.success("Cập nhật vai trò thành công.");
      onSuccess();
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể cập nhật vai trò.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async (values) => {
    const nextRole = values.role;
    const grantedSubjectCount = Object.values(permissionMap).filter((permissions) => permissions?.length).length;

    if (originalRole === "MOD" && nextRole !== "MOD" && grantedSubjectCount > 0) {
      Modal.confirm({
        title: "Thu hoi quyen theo mon?",
        content: "Khi tài khoản không còn là MOD, backend sẽ thu hồi toàn bộ quyền theo môn. Nếu chuyển lại MOD, cần cấp quyền lại thủ công.",
        okText: "Cập nhật vai trò",
        cancelText: "Hủy",
        onOk: () => submitRoleUpdate(nextRole),
      });
      return;
    }

    submitRoleUpdate(nextRole);
  };

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}><EditOutlined style={{ marginRight: 8 }} /> Cập nhật người dùng</Title>}
      open={isModalOpen}
      onCancel={onCancel}
      footer={null}
      width={720}
      centered
      maskClosable={false}
      confirmLoading={loadingUser}
    >
      <Divider style={{ margin: "16px 0" }} />
      {loadingUser ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Text type="secondary">Đang tải dữ liệu...</Text>
        </div>
      ) : (
        <>
          {originalRole === "MOD" && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message="Tài khoản MOD"
              description="Nếu đổi sang USER hoặc ADMIN, các quyền theo môn sẽ bị backend thu hồi."
            />
          )}

          <Form form={form} layout="vertical" onFinish={handleUpdateUser}>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Họ và tên" name="fullName">
                  <Input prefix={<UserOutlined />} disabled />
                </Form.Item>
                <Form.Item label="Email" name="email">
                  <Input prefix={<MailOutlined />} disabled />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Vai trò" name="role" rules={[{ required: true, message: "Chọn vai trò" }]}>
                  <Select>
                    <Option value="USER">USER</Option>
                    <Option value="MOD">MOD</Option>
                    <Option value="ADMIN">ADMIN</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Hành động">
                  <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    <Button style={cancelButtonStyle} onClick={onCancel}>Hủy</Button>
                    <Button type="default" style={primaryButtonStyle} htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                      Lưu vai trò
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default UpdateUserModal;
