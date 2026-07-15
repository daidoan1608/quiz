import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Checkbox, Input, Modal, Space, Table, Tag, Tooltip, Typography, message } from "antd";
import { SafetyCertificateOutlined, SaveOutlined } from "@ant-design/icons";
import { authAxios } from "../../api/axiosConfig";
import { categoryApi, subjectApi } from "../../api/services";

const { Text } = Typography;

const PERMISSIONS = [
  { label: "READ", value: "READ", color: "blue" },
  { label: "CREATE", value: "CREATE", color: "green" },
  { label: "UPDATE", value: "UPDATE", color: "orange" },
  { label: "DELETE", value: "DELETE", color: "red" },
];

const QUICK_SETS = {
  readOnly: ["READ"],
  contentManager: ["READ", "CREATE", "UPDATE"],
  full: ["READ", "CREATE", "UPDATE", "DELETE"],
  none: [],
};

const normalizePermissionMap = (value) => {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value).map(([subjectId, permissions]) => [
      String(subjectId),
      Array.isArray(permissions) ? permissions : [],
    ])
  );
};

const SubjectPermissionModal = ({ isModalOpen, onCancel, user }) => {
  const [subjects, setSubjects] = useState([]);
  const [permissionMap, setPermissionMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [savingSubjectId, setSavingSubjectId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const fetchSubjects = useCallback(async () => {
    const categories = await categoryApi.getAll();
    const subjectGroups = await Promise.all(
      categories.map(async (category) => {
        const categorySubjects = await subjectApi.getByCategory(category.categoryId);
        return categorySubjects.map((subject) => ({
          ...subject,
          categoryId: category.categoryId,
          categoryName: category.categoryName,
        }));
      })
    );
    setSubjects(subjectGroups.flat());
  }, []);

  const fetchPermissions = useCallback(async () => {
    if (!user?.userId) return;
    const response = await authAxios.get(`/admin/permissions/mod/${user.userId}`);
    setPermissionMap(normalizePermissionMap(response.data));
  }, [user?.userId]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchSubjects(), fetchPermissions()]);
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể tải dữ liệu phân quyền.");
    } finally {
      setLoading(false);
    }
  }, [fetchPermissions, fetchSubjects]);

  useEffect(() => {
    if (isModalOpen) reload();
  }, [isModalOpen, user?.userId, reload]);

  const filteredSubjects = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return subjects;
    return subjects.filter((subject) =>
      `${subject.name || ""} ${subject.categoryName || ""} ${subject.subjectId || ""}`
        .toLowerCase()
        .includes(keyword)
    );
  }, [subjects, searchText]);

  const updateLocalPermissions = (subjectId, permissions) => {
    setPermissionMap((prev) => ({
      ...prev,
      [String(subjectId)]: permissions,
    }));
  };

  const savePermissions = async (subjectId, permissions = permissionMap[String(subjectId)] || []) => {
    const normalizedPermissions = [...new Set(permissions)].filter(Boolean);
    setSavingSubjectId(subjectId);
    try {
      await authAxios.post("/admin/permissions/subject-assignment", {
        modUserId: user.userId,
        subjectId,
        permissions: normalizedPermissions,
      });
      updateLocalPermissions(subjectId, normalizedPermissions);
      message.success(normalizedPermissions.length ? "Đã lưu quyền môn học." : "Đã xóa quyền môn học.");
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể lưu quyền.");
    } finally {
      setSavingSubjectId(null);
    }
  };

  const applyQuickSet = async (subjectId, setName) => {
    const nextPermissions = [...(QUICK_SETS[setName] || [])];
    updateLocalPermissions(subjectId, nextPermissions);
    await savePermissions(subjectId, nextPermissions);
  };

  const columns = [
    {
      title: "Môn học",
      dataIndex: "name",
      key: "name",
      width: 260,
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.categoryName || "Không rõ khoa"} · ID {record.subjectId}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Quyền",
      key: "permissions",
      width: 360,
      render: (_, record) => {
        const value = permissionMap[String(record.subjectId)] || [];
        return (
          <Checkbox.Group
            value={value}
            onChange={(nextValue) => updateLocalPermissions(record.subjectId, nextValue)}
          >
            <Space wrap>
              {PERMISSIONS.map((permission) => (
                <Checkbox key={permission.value} value={permission.value}>
                  <Tag color={permission.color}>{permission.label}</Tag>
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        );
      },
    },
    {
      title: "Mẫu nhanh",
      key: "quick",
      width: 250,
      render: (_, record) => (
        <Space wrap>
          <Button className="compact-btn" disabled={savingSubjectId === record.subjectId} onClick={() => applyQuickSet(record.subjectId, "readOnly")}>Chỉ đọc</Button>
          <Button className="compact-btn" disabled={savingSubjectId === record.subjectId} onClick={() => applyQuickSet(record.subjectId, "contentManager")}>Quản lý nội dung</Button>
          <Button className="compact-btn" disabled={savingSubjectId === record.subjectId} onClick={() => applyQuickSet(record.subjectId, "full")}>Tất cả</Button>
          <Button className="compact-btn" danger disabled={savingSubjectId === record.subjectId} onClick={() => applyQuickSet(record.subjectId, "none")}>Xóa</Button>
        </Space>
      ),
    },
    {
      title: "Lưu",
      key: "save",
      width: 90,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title="Lưu quyền cho môn này">
          <Button
            className="action-btn is-primary"
            icon={<SaveOutlined />}
            loading={savingSubjectId === record.subjectId}
            onClick={() => savePermissions(record.subjectId)}
          />
        </Tooltip>
      ),
    },
  ];

  const grantedSubjectCount = Object.values(permissionMap).filter((permissions) => permissions?.length).length;

  return (
    <Modal
      title={<Space><SafetyCertificateOutlined /> Phân quyền môn học</Space>}
      open={isModalOpen}
      onCancel={onCancel}
      footer={[
        <Button key="reload" onClick={reload} loading={loading}>Tải lại</Button>,
        <Button key="close" onClick={onCancel}>Đóng</Button>,
      ]}
      width={1080}
      centered
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={user ? `${user.fullName || user.username} (${user.role})` : ""}
        description={`Đang có ${grantedSubjectCount} môn học được cấp quyền. Việc thay đổi vai trò sẽ thu hồi toàn bộ quyền theo môn.`}
      />

      <Input.Search
        placeholder="Tìm môn học, khoa, ID..."
        allowClear
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        style={{ maxWidth: 360, marginBottom: 16 }}
      />

      <Table
        columns={columns}
        dataSource={filteredSubjects}
        rowKey="subjectId"
        loading={loading}
        pagination={{ pageSize: 6, showSizeChanger: false }}
        scroll={{ x: 980 }}
      />
    </Modal>
  );
};

export default SubjectPermissionModal;
