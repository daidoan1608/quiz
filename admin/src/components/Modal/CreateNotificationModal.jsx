import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Form, Input, Select, message, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { authAxios } from "../../api/axiosConfig";
import { userApi } from "../../api/services/userApi";

const { Option } = Select;
const { TextArea } = Input;

const CreateNotificationModal = ({ isModalOpen, onCancel, onSuccess, createForm, notificationType, setNotificationType }) => {
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const userSearchTimerRef = useRef(null);

  const fetchSubjects = useCallback(async () => {
    setLoadingSubjects(true);
    try {
      const response = await authAxios.get('/public/subjects');
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách môn học:", error);
      message.error('Không thể tải danh sách môn học.');
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen && notificationType === 'SUBJECT' && subjects.length === 0) {
      fetchSubjects();
    }
  }, [isModalOpen, notificationType, subjects.length, fetchSubjects]);

  const fetchUsers = useCallback(async (keyword) => {
    if (!keyword || keyword.trim().length < 2) {
      setUsers([]);
      return;
    }

    setLoadingUsers(true);
    try {
      const result = await userApi.search(keyword.trim(), 20);
      setUsers(result);
    } catch (error) {
      console.error("Lỗi khi tìm người dùng:", error);
      message.error('Không thể tìm người dùng.');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const searchUsers = useCallback((keyword) => {
    if (userSearchTimerRef.current) {
      clearTimeout(userSearchTimerRef.current);
    }
    userSearchTimerRef.current = setTimeout(() => {
      fetchUsers(keyword);
    }, 400);
  }, [fetchUsers]);

  useEffect(() => () => {
    if (userSearchTimerRef.current) {
      clearTimeout(userSearchTimerRef.current);
    }
  }, []);

  const handleTypeChange = (value) => {
    setNotificationType(value);
    createForm.setFieldsValue({ targetId: undefined });
    setUsers([]);
  };

  const handleCreate = async (values) => {
    try {
      let endpoint = '/admin/notifications';
      const payload = { title: values.title, message: values.message };

      if (values.type === 'GLOBAL') {
        endpoint += '/global';
      } else if (values.type === 'PERSONAL') {
        endpoint += '/personal';
        payload.userId = values.targetId;
      } else if (values.type === 'SUBJECT') {
        endpoint += '/subject';
        payload.subjectId = values.targetId;
        payload.subjectName = subjects.find((subject) => subject.subjectId === values.targetId)?.name || 'Thông báo môn học';
      } else if (values.type === 'BATCH') {
        endpoint += '/batch';
        payload.userIds = values.targetId;
      }

      await authAxios.post(endpoint, payload);
      message.success('Gửi thông báo thành công!');
      onSuccess();
    } catch (error) {
      console.error(error);
      message.error('Gửi thất bại: ' + (error.response?.data?.message || error.message || 'Lỗi không xác định'));
    }
  };

  const renderUserOptions = () => users.map((user) => (
    <Option key={user.userId} value={user.userId}>
      {user.fullName || user.username} - {user.email || user.username}
    </Option>
  ));

  return (
    <Modal
      title="Gửi thông báo mới"
      open={isModalOpen}
      onCancel={onCancel}
      onOk={() => createForm.submit()}
      okText="Gửi ngay"
      cancelText="Hủy"
      centered
    >
      <Form
        form={createForm}
        layout="vertical"
        onFinish={handleCreate}
        initialValues={{ type: 'GLOBAL' }}
      >
        <Form.Item name="type" label="Loại thông báo">
          <Select onChange={handleTypeChange}>
            <Option value="GLOBAL">Toàn hệ thống (Global)</Option>
            <Option value="PERSONAL">Cá nhân (Personal)</Option>
            <Option value="SUBJECT">Theo môn học (Subject)</Option>
            <Option value="BATCH">Danh sách (Batch)</Option>
          </Select>
        </Form.Item>

        {notificationType === 'PERSONAL' && (
          <Form.Item name="targetId" label="Người nhận" rules={[{ required: true, message: 'Vui lòng chọn người nhận' }]}>
            <Select
              showSearch
              filterOption={false}
              placeholder="Nhập tên, username, email hoặc ID..."
              suffixIcon={<UserOutlined />}
              loading={loadingUsers}
              notFoundContent={loadingUsers ? <Spin size="small" /> : 'Không tìm thấy người dùng'}
              onSearch={searchUsers}
            >
              {renderUserOptions()}
            </Select>
          </Form.Item>
        )}

        {notificationType === 'SUBJECT' && (
          <Form.Item
            name="targetId"
            label="Môn học"
            rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
          >
            <Select
              showSearch
              placeholder="Chọn môn học..."
              optionFilterProp="children"
              loading={loadingSubjects}
              notFoundContent={loadingSubjects ? <Spin size="small" /> : 'Không tìm thấy môn học nào'}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {subjects.map((subject) => (
                <Option key={subject.subjectId} value={subject.subjectId}>
                  {subject.name} (ID: {subject.subjectId})
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {notificationType === 'BATCH' && (
          <Form.Item name="targetId" label="Danh sách người nhận" rules={[{ required: true, message: 'Vui lòng chọn người nhận' }]}>
            <Select
              mode="multiple"
              showSearch
              filterOption={false}
              placeholder="Nhập tên, username, email hoặc ID để thêm người nhận..."
              loading={loadingUsers}
              notFoundContent={loadingUsers ? <Spin size="small" /> : 'Không tìm thấy người dùng'}
              onSearch={searchUsers}
            >
              {renderUserOptions()}
            </Select>
          </Form.Item>
        )}

        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
          <Input placeholder="Ví dụ: Bảo trì hệ thống" />
        </Form.Item>

        <Form.Item name="message" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
          <TextArea rows={4} placeholder="Nhập nội dung chi tiết..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateNotificationModal;
