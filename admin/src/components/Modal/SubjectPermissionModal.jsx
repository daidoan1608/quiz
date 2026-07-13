import React, { useEffect, useState, useCallback } from "react";
import { Modal, Form, Select, Checkbox, Button, Alert, message, Space } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { authAxios, publicAxios } from "../../api/axiosConfig";

const PERMISSIONS = [
  { label: "Xem", value: "READ" },
  { label: "Them", value: "CREATE" },
  { label: "Sua", value: "UPDATE" },
  { label: "Xoa", value: "DELETE" },
];

const SubjectPermissionModal = ({ isModalOpen, onCancel, user }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [permissionMap, setPermissionMap] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    const response = await publicAxios.get("/public/categories");
    const data = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    setCategories(Array.isArray(data[0]) ? data[0] : data);
  }, []);

  const fetchPermissions = useCallback(async () => {
    if (!user?.userId) return;
    const response = await authAxios.get(`/admin/permissions/mod/${user.userId}`);
    setPermissionMap(response.data || {});
  }, [user?.userId]);

  useEffect(() => {
    if (!isModalOpen) return;
    fetchCategories().catch(() => message.error("Khong the tai danh sach mon hoc."));
    fetchPermissions().catch(() => message.error("Khong the tai quyen hien tai."));
  }, [isModalOpen, fetchCategories, fetchPermissions]);

  const handleCategoryChange = (categoryId) => {
    const category = categories.find((item) => item.categoryId === categoryId);
    setSubjects(category?.subjects || []);
    form.setFieldsValue({ subjectId: null, permissions: [] });
  };

  const handleSubjectChange = (subjectId) => {
    form.setFieldsValue({ permissions: permissionMap[subjectId] || [] });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await authAxios.post("/admin/permissions/subject-assignment", {
        modUserId: user.userId,
        subjectId: values.subjectId,
        permissions: values.permissions || [],
      });
      message.success("Da cap nhat quyen mon hoc.");
      setPermissionMap((prev) => ({
        ...prev,
        [values.subjectId]: values.permissions || [],
      }));
    } catch (error) {
      message.error(error.response?.data?.message || "Khong the cap nhat quyen.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setSubjects([]);
    setPermissionMap({});
    onCancel();
  };

  return (
    <Modal
      title={<Space><SafetyCertificateOutlined /> Phan quyen mon hoc</Space>}
      open={isModalOpen}
      onCancel={handleClose}
      footer={null}
      width={620}
      centered
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={user ? `${user.fullName || user.username} (${user.role})` : ""}
        description="Chi ap dung cho tai khoan MOD. Chon tung mon de cap nhat nhom quyen rieng."
      />

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Khoa" name="categoryId" rules={[{ required: true, message: "Chon khoa" }]}>
          <Select placeholder="Chon khoa" onChange={handleCategoryChange} showSearch optionFilterProp="children">
            {categories.map((category) => (
              <Select.Option key={category.categoryId} value={category.categoryId}>
                {category.categoryName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Mon hoc" name="subjectId" rules={[{ required: true, message: "Chon mon hoc" }]}>
          <Select
            placeholder="Chon mon hoc"
            disabled={subjects.length === 0}
            onChange={handleSubjectChange}
            showSearch
            optionFilterProp="children"
          >
            {subjects.map((subject) => (
              <Select.Option key={subject.subjectId} value={subject.subjectId}>
                {subject.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Quyen" name="permissions" rules={[{ required: true, message: "Chon it nhat mot quyen" }]}>
          <Checkbox.Group options={PERMISSIONS} />
        </Form.Item>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={handleClose}>Dong</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Luu quyen
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default SubjectPermissionModal;
