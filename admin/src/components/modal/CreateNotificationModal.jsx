import React, {useState ,useEffect} from 'react';
import { Modal, Form, Input, Select, message ,Spin} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { authAxios } from "../../api/axiosConfig"; // Cần đảm bảo import đúng đường dẫn

const { Option } = Select;
const { TextArea } = Input;

const CreateNotificationModal = ({ isModalOpen, onCancel, onSuccess, createForm, notificationType, setNotificationType }) => {
const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  // --- LOGIC XỬ LÝ GỬI THÔNG BÁO ---

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      // **GIẢ ĐỊNH**: API endpoint của bạn trả về danh sách môn học
      // Ví dụ: [{ id: 101, name: 'Toán Cao Cấp' }, { id: 102, name: 'Vật Lý Đại Cương' }, ...]
      const response = await authAxios.get('/public/subjects');
      setSubjects(response.data.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách môn học:", error);
      message.error('Không thể tải danh sách môn học.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && notificationType === 'SUBJECT' && subjects.length === 0) {
      fetchSubjects();
    }
  }, [isModalOpen, notificationType]);

  const handleCreate = async (values) => {
    try {
      let endpoint = '/admin/notifications'; // Cần điều chỉnh base endpoint nếu cần, tôi sẽ dùng endpoint của API để request
      let payload = { title: values.title, message: values.message };

      if (values.type === 'GLOBAL') {
        endpoint += '/global';
      } else if (values.type === 'PERSONAL') {
        endpoint += '/personal';
        payload.userId = values.targetId;
      } else if (values.type === 'SUBJECT') {
        endpoint += '/subject';
        payload.subjectId = values.targetId;
        payload.subjectName = "Thông báo môn học"; // Đã được định nghĩa trong component gốc
      } else if (values.type === 'BATCH') {
        endpoint += '/batch';
        payload.userIds = values.targetId.split(',').map(id => id.trim());
      }

      await authAxios.post(endpoint, payload);
      message.success('Gửi thông báo thành công!');
      onSuccess(); // Gọi hàm thành công để đóng modal và làm mới dữ liệu
    } catch (error) {
      console.error(error);
      message.error('Gửi thất bại: ' + (error.response?.data?.message || error.message || 'Lỗi không xác định'));
    }
  };

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
          <Select onChange={setNotificationType}>
            <Option value="GLOBAL">Toàn hệ thống (Global)</Option>
            <Option value="PERSONAL">Cá nhân (Personal)</Option>
            <Option value="SUBJECT">Theo môn học (Subject)</Option>
            <Option value="BATCH">Danh sách (Batch)</Option>
          </Select>
        </Form.Item>

        {notificationType === 'PERSONAL' && (
          <Form.Item name="targetId" label="User ID (UUID)" rules={[{ required: true, message: 'Vui lòng nhập ID người nhận' }]}>
            <Input placeholder="Nhập UUID của người nhận" prefix={<UserOutlined />} />
          </Form.Item>
        )}

{notificationType === 'SUBJECT' && (
      <Form.Item
        name="targetId"
        label="Môn học (Tìm kiếm theo Tên)"
        rules={[{ required: true, message: 'Vui lòng chọn ID môn học' }]}
      >
        <Select
          showSearch // Bật tính năng tìm kiếm
          placeholder="Chọn môn học..."
          optionFilterProp="children" // Lọc theo nội dung của Option (tên môn học)
          loading={loadingSubjects} // Hiển thị trạng thái tải
          notFoundContent={loadingSubjects ? <Spin size="small" /> : 'Không tìm thấy môn học nào'}

          // Bộ lọc tùy chỉnh: Tìm kiếm không phân biệt chữ hoa/thường
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {/* Lặp qua danh sách môn học đã lấy từ API */}
          {subjects.map((subject) => (
            <Option key={subject.subjectId} value={subject.subjectId}>
              {subject.name} (ID: {subject.subjectId})
            </Option>
          ))}
        </Select>
      </Form.Item>
    )}

        {notificationType === 'BATCH' && (
          <Form.Item name="targetId" label="Danh sách User IDs" rules={[{ required: true, message: 'Vui lòng nhập danh sách User IDs' }]}>
            <TextArea rows={2} placeholder="Nhập các UUID cách nhau bởi dấu phẩy" />
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