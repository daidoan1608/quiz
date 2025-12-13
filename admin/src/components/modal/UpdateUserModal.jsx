import React, { useEffect, useState } from "react";
import {
  Form, Input, Button, Card, Select, message,
  Row, Col, Typography, Table, Tag, Space,
  Checkbox, Popconfirm, Modal, Divider
} from "antd";
import {
  UserOutlined, MailOutlined, SaveOutlined, EditOutlined,
  DeleteOutlined, SafetyCertificateOutlined, PlusOutlined, CloseOutlined
} from "@ant-design/icons";
import { authAxios } from "../../api/axiosConfig"; // Điều chỉnh đường dẫn nếu cần

const { Title, Text } = Typography;
const { Option } = Select;

const ALL_PERMISSIONS = ["CREATE", "READ", "UPDATE", "DELETE"];
const PERMISSION_OPTIONS = ALL_PERMISSIONS.map((p) => ({ label: p, value: p }));

const UpdateUserModal = ({ isModalOpen, onCancel, onSuccess, userId }) => {
  const [form] = Form.useForm();
  const [loadingUser, setLoadingUser] = useState(false);
  const [currentRole, setCurrentRole] = useState("USER");
  const [currentModPermissions, setCurrentModPermissions] = useState({});
  const [categories, setCategories] = useState([]);

  const [isEditingPerm, setIsEditingPerm] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [showPermForm, setShowPermForm] = useState(false);

  // --- FETCH CATEGORIES ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await authAxios.get("/public/categories");
        const data = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        setCategories(Array.isArray(data[0]) ? data[0] : data);
      } catch (error) {
        console.error("Lỗi danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  // --- FETCH USER DETAILS ---
  useEffect(() => {
    if (!isModalOpen || !userId) return;

    const fetchUserDetails = async () => {
      setLoadingUser(true);
      try {
        const response = await authAxios.get(`user/${userId}`);
        const userData = response.data.data;

        form.setFieldsValue({
          fullName: userData.fullName,
          email: userData.email,
          role: userData.role || "USER",
        });

        const role = userData.role || "USER";
        setCurrentRole(role);

        if (role === "MOD") {
          fetchModPermissions(userId);
        } else {
          setCurrentModPermissions({});
        }
      } catch (error) {
        message.error("Không thể lấy thông tin người dùng!");
        onCancel();
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserDetails();
  }, [userId, isModalOpen, form, onCancel]);

  const fetchModPermissions = async (modId) => {
    try {
      const response = await authAxios.get(`/admin/permissions/mod/${modId}`);
      setCurrentModPermissions(response.data || {});
      resetPermForm();
    } catch (error) {
      console.error("Lỗi fetch permissions:", error);
      setCurrentModPermissions({});
    }
  };

  // --- HANDLERS ---
  const handleUpdateUser = async (values) => {
    try {
      await authAxios.patch(`/update/users/${userId}`, values);

      const hasPermissions = Object.keys(currentModPermissions).length > 0;
      if (values.role !== "MOD" && hasPermissions) {
        // Tự động xóa quyền nếu chuyển từ MOD sang role khác và user đó có quyền
        await authAxios.delete(`/delete/permissions/mod/${userId}`);
        setCurrentModPermissions({});
      }

      message.success("Cập nhật thông tin người dùng thành công!");
      onSuccess();
    } catch (error) {
      message.error(
        "Lỗi cập nhật: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    if (newRole !== "MOD") {
      setShowPermForm(false);
    } else {
      fetchModPermissions(userId); // Load lại quyền nếu chuyển sang MOD
    }
  };

  // --- QUẢN LÝ QUYỀN ---

  const getSubjectsByCategory = () => {
    if (!selectedCategoryId) return [];
    const cat = categories.find(
      (c) => c.categoryId === Number(selectedCategoryId)
    );
    return cat ? cat.subjects || [] : [];
  };

  const getSubjectName = (subId) => {
    for (const cat of categories) {
      if (cat.subjects) {
        const sub = cat.subjects.find(
          (s) => String(s.subjectId) === String(subId)
        );
        if (sub) return sub.name;
      }
    }
    return `ID: ${subId}`;
  };

  const resetPermForm = () => {
    setSelectedCategoryId(null);
    setSelectedSubjectId(null);
    setSelectedPermissions([]);
    setIsEditingPerm(false);
    setEditingSubjectId(null);
    setShowPermForm(false);
  };

  const handleEditPermissionClick = (subId, perms) => {
    // Logic tìm CategoryId của SubjectId
    let foundCatId = null;
    for (const cat of categories) {
      if (
        cat.subjects &&
        cat.subjects.some((s) => String(s.subjectId) === String(subId))
      ) {
        foundCatId = cat.categoryId;
        break;
      }
    }

    setEditingSubjectId(subId);
    setSelectedSubjectId(subId);
    setSelectedCategoryId(foundCatId);
    setSelectedPermissions(perms);

    setIsEditingPerm(true);
    setShowPermForm(true);
  };

  const handleDeletePermission = async (subId) => {
    try {
      await authAxios.delete(`/delete/permissions/mod/${userId}/${subId}`);
      message.success("Đã xóa quyền quản lý môn học này");
      fetchModPermissions(userId);
    } catch (error) {
      message.error("Không thể xóa quyền!");
    }
  };

  const handleSavePermission = async () => {
    if (!selectedSubjectId || selectedPermissions.length === 0) {
      message.warning("Vui lòng chọn môn học và ít nhất 1 quyền!");
      return;
    }

    const payload = {
      modUserId: userId,
      subjectId: parseInt(selectedSubjectId),
      permissions: selectedPermissions,
    };

    try {
      await authAxios.post(`/admin/permissions/subject-assignment`, payload);
      message.success(
        isEditingPerm ? "Cập nhật quyền thành công!" : "Thêm quyền thành công!"
      );
      fetchModPermissions(userId); // Tải lại quyền
    } catch (error) {
      message.error("Lỗi khi lưu quyền!");
    }
  };

  const permissionData = Object.entries(currentModPermissions).map(
    ([subId, perms]) => ({
      key: subId,
      subjectId: subId,
      subjectName: getSubjectName(subId),
      permissions: perms,
    })
  );

  const permColumns = [
    {
      title: "Môn học",
      dataIndex: "subjectName",
      key: "subjectName",
      width: '40%',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text> <br />
          <Text type="secondary" style={{ fontSize: 12 }}>ID: {record.subjectId}</Text>
        </div>
      ),
    },
    {
      title: "Các quyền được cấp",
      dataIndex: "permissions",
      key: "permissions",
      width: '45%',
      render: (perms) => (
        <>
          {perms.map((p) => {
            let color = "geekblue";
            if (p === "DELETE") color = "red";
            if (p === "CREATE") color = "green";
            return (
              <Tag color={color} key={p}>{p}</Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: '15%',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() =>
              handleEditPermissionClick(record.subjectId, record.permissions)
            }
          />
          <Popconfirm
            title="Xóa quyền này?"
            onConfirm={() => handleDeletePermission(record.subjectId)}
            okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <EditOutlined style={{ marginRight: 8 }} /> Cập nhật người dùng id: {userId}
        </Title>
      }
      open={isModalOpen}
      onCancel={onCancel}
      footer={null}
      width={900}
      centered
      maskClosable={false}
      confirmLoading={loadingUser}
    >
      <Divider style={{ margin: '16px 0' }} />
      {loadingUser ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}><Text type="secondary">Đang tải dữ liệu...</Text></div>
      ) : (
        <>
          <Form form={form} layout="vertical" onFinish={handleUpdateUser}>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Họ và tên" name="fullName" rules={[{ required: true }]}>
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
                <Form.Item label="Email" name="email">
                  <Input prefix={<MailOutlined />} disabled />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Vai trò" name="role">
                  <Select onChange={handleRoleChange}>
                    <Option value="USER">USER</Option>
                    <Option value="MOD">MOD</Option>
                    <Option value="ADMIN">ADMIN</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Hành động">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    block
                  >
                    Lưu thông tin cơ bản
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>

          {/* HIỂN THỊ PHẦN QUYỀN MOD DỰA TRÊN currentRole */}
          {currentRole === "MOD" && (
            <div>
              <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                  <Title level={4} style={{ margin: 0 }}>
                    <SafetyCertificateOutlined /> Quyền Kiểm Duyệt Viên
                  </Title>
                </Col>
                <Col>
                  {!showPermForm && (
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        resetPermForm();
                        setShowPermForm(true);
                      }}
                    >
                      Thêm quyền mới
                    </Button>
                  )}
                </Col>
              </Row>

              <Table
                columns={permColumns}
                dataSource={permissionData}
                pagination={false}
                locale={{ emptyText: "Chưa có quyền nào được cấp" }}
                bordered
                size="small"
                scroll={{ y: 200 }}
              />

              {showPermForm && (
                <Card
                  type="inner"
                  title={isEditingPerm ? `Sửa quyền cho môn: ${getSubjectName(editingSubjectId)}` : "Thêm quyền quản lý môn học mới"}
                  extra={
                    <Button type="text" icon={<CloseOutlined />} onClick={resetPermForm} danger>
                      Đóng
                    </Button>
                  }
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <div style={{ marginBottom: 8 }}>Chọn Khoa:</div>
                      <Select
                        style={{ width: "100%" }}
                        placeholder="-- Chọn khoa --"
                        value={selectedCategoryId}
                        onChange={(val) => {
                          setSelectedCategoryId(val);
                          setSelectedSubjectId(null);
                        }}
                        disabled={isEditingPerm}
                      >
                        {categories.map((c) => (
                          <Option key={c.categoryId} value={c.categoryId}>{c.categoryName}</Option>
                        ))}
                      </Select>
                    </Col>

                    <Col xs={24} md={12}>
                      <div style={{ marginBottom: 8 }}>Chọn Môn học:</div>
                      <Select
                        style={{ width: "100%" }}
                        placeholder="-- Chọn môn học --"
                        value={selectedSubjectId ? String(selectedSubjectId) : null}
                        onChange={setSelectedSubjectId}
                        disabled={!selectedCategoryId || isEditingPerm}
                        showSearch
                        optionFilterProp="children"
                      >
                        {getSubjectsByCategory().map((s) => (
                          <Option key={s.subjectId} value={String(s.subjectId)}>{s.name}</Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>

                  <div style={{ marginTop: 16 }}>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>Chọn các quyền:</div>
                    <Checkbox.Group
                      options={PERMISSION_OPTIONS}
                      value={selectedPermissions}
                      onChange={setSelectedPermissions}
                    />
                  </div>

                  <div style={{ marginTop: 24, textAlign: "right" }}>
                    <Space>
                      <Button onClick={resetPermForm}>Hủy</Button>
                      <Button type="primary" onClick={handleSavePermission}>
                        {isEditingPerm ? "Lưu thay đổi" : "Thêm quyền"}
                      </Button>
                    </Space>
                  </div>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default UpdateUserModal;