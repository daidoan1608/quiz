import React, { useEffect, useState, useCallback } from 'react';
import {
  Form, Input, Button, Modal,
  Typography, message, Divider,
  Space, Skeleton
} from 'antd';
import {
  SaveOutlined,
  EditOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { authAxios } from '../../api/axiosConfig'; // Điều chỉnh đường dẫn nếu cần

const { Title } = Typography;
const { TextArea } = Input;

const UpdateSubjectModal = ({ isModalOpen, onCancel, onSuccess, subjectId }) => {
  const [form] = Form.useForm();

  // Quản lý trạng thái
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Lấy thông tin môn học ban đầu
  const fetchSubjectDetails = useCallback(async () => {
    if (!subjectId || !isModalOpen) {
        setLoadingData(true);
        return;
    }
    setLoadingData(true);
    try {
      const res = await authAxios.get(`public/subjects/${subjectId}`);
      // Đổ dữ liệu vào form
      form.setFieldsValue(res.data.data);
    } catch (error) {
      console.error("Lỗi:", error);
      message.error('Không thể lấy thông tin môn học!');
      onCancel(); // Đóng modal nếu lỗi nghiêm trọng
    } finally {
      setLoadingData(false);
    }
  }, [subjectId, isModalOpen, form, onCancel]);

  useEffect(() => {
    if (isModalOpen && subjectId) {
        fetchSubjectDetails();
    }
  }, [isModalOpen, subjectId, fetchSubjectDetails]);

  // Xử lý submit form
  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await authAxios.patch(`/admin/subjects/${subjectId}`, values);
      message.success('Môn học đã được cập nhật thành công!');
      onSuccess(); // Gọi callback để đóng modal và làm mới danh sách
    } catch (error) {
      console.error("Lỗi update:", error);
      message.error(
        error.response?.data?.message || 'Không thể cập nhật môn học! Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
      // Không cần resetFields vì dữ liệu sẽ được fetch lại khi modal mở
      onCancel();
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <EditOutlined style={{ marginRight: 8 }} /> Cập nhật môn học ID: {subjectId}
        </Title>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button
          key="restore"
          icon={<ReloadOutlined />}
          onClick={fetchSubjectDetails}
          disabled={loadingData}
        >
          Khôi phục gốc
        </Button>,
        <Button key="back" onClick={handleCancel}>
          Hủy bỏ
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={submitting}
          onClick={() => form.submit()}
        >
          Lưu thay đổi
        </Button>,
      ]}
      width={500}
      centered
      maskClosable={false}
    >
      <Divider style={{ margin: '16px 0' }} />
      {loadingData ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          {/* Tên môn học */}
          <Form.Item
            label="Tên môn học"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên môn học!" },
              { min: 3, message: "Tên môn học quá ngắn!" }
            ]}
          >
            <Input placeholder="Ví dụ: Lập trình Java" />
          </Form.Item>

          {/* Mô tả */}
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập mô tả chi tiết..."
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default UpdateSubjectModal;