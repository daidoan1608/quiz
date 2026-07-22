import React from 'react';
import { Modal, Form, Input, Select, Spin, Typography } from 'antd';
import {
  BellOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { NOTIFICATION_TEMPLATES } from "../constants";
import { useNotificationForm } from "../hooks/useNotificationForm";
import { buildAdminModalFooter } from "../../../components/common/forms/AdminFormActions";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const CreateNotificationModal = ({ isModalOpen, onCancel, onSuccess, createForm, notificationType, setNotificationType }) => {
  const {
    subjects,
    loadingSubjects,
    users,
    loadingUsers,
    submitting,
    watchedTitle,
    watchedMessage,
    currentTemplate,
    availableNotificationTypes,
    searchUsers,
    handleTypeChange,
    handleCreate,
  } = useNotificationForm({
    isModalOpen,
    createForm,
    notificationType,
    setNotificationType,
    notificationTemplates: NOTIFICATION_TEMPLATES,
    onSuccess,
  });

  const renderUserOptions = () => users.map((user) => (
    <Option key={user.userId} value={user.userId}>
      {user.fullName || user.username} - {user.email || user.username}
    </Option>
  ));

  return (
    <Modal
      className="notification-template-modal"
      title={null}
      open={isModalOpen}
      onCancel={onCancel}
      footer={buildAdminModalFooter({
        loading: submitting,
        onCancel,
        onSubmit: () => createForm.submit(),
        saveClassName: "notification-template-submit",
        saveIcon: <SendOutlined />,
        saveText: "Gửi ngay",
      })}
      width={680}
      centered
    >
      <div
        className="notification-template-hero"
        style={{ '--notification-accent': currentTemplate.accent }}
      >
        <div className="notification-template-icon">
          <BellOutlined />
        </div>
        <div>
          <Text className="notification-template-kicker">Popup thông báo</Text>
          <h2>Gửi thông báo mới</h2>
          <p>{currentTemplate.helper}</p>
        </div>
      </div>

      <Form
        form={createForm}
        layout="vertical"
        onFinish={handleCreate}
        initialValues={{ type: 'GLOBAL' }}
      >
        <Form.Item name="type" label="Loại thông báo">
          <Select
            className="notification-template-type-select"
            onChange={handleTypeChange}
            optionLabelProp="label"
          >
            {availableNotificationTypes.map(([value, template]) => (
              <Option key={value} value={value} label={template.label}>
                <div className="notification-template-option">
                  <span style={{ color: template.accent }}>{template.icon}</span>
                  <div>
                    <strong>{template.label}</strong>
                    <small>{template.helper}</small>
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <div className="notification-template-grid">
          <div className="notification-template-fields">
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
              <TextArea rows={5} showCount maxLength={500} placeholder="Nhập nội dung chi tiết..." />
            </Form.Item>
          </div>

          <aside
            className="notification-template-preview"
            style={{ '--notification-accent': currentTemplate.accent }}
          >
            <span className="notification-template-preview-icon">
              {currentTemplate.icon}
            </span>
            <Text className="notification-template-preview-label">
              {currentTemplate.label}
            </Text>
            <h3>{watchedTitle || 'Tiêu đề thông báo'}</h3>
            <p>{watchedMessage || 'Nội dung sẽ được xem trước tại đây trước khi gửi đến người nhận.'}</p>
          </aside>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateNotificationModal;
