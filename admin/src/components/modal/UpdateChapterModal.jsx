import React, { useEffect, useState, useCallback } from "react";
import {
  Form, Input, Button, Modal,
  InputNumber, message, Typography,
  Divider, Space, Skeleton
} from "antd";
import {
  SaveOutlined,
  EditOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { authAxios } from "../../api/axiosConfig"; // Điều chỉnh đường dẫn nếu cần

const { Title, Text } = Typography;

const UpdateChapterModal = ({ isModalOpen, onCancel, onSuccess, chapterId }) => {
  const [form] = Form.useForm();

  // State quản lý trạng thái
  const [loadingData, setLoadingData] = useState(true); // Loading khi lấy dữ liệu
  const [submitting, setSubmitting] = useState(false); // Loading khi lưu

  // Lấy thông tin chương ban đầu
  const fetchChapterDetails = useCallback(async () => {
    if (!chapterId || !isModalOpen) return;
    setLoadingData(true);
    try {
      const response = await authAxios.get(`/public/chapters/${chapterId}`);
      // Antd Form tự động map dữ liệu vào các field có name tương ứng
      form.setFieldsValue(response.data.data);
    } catch (error) {
      console.error("Lỗi API:", error);
      message.error("Không thể lấy thông tin chương!");
      onCancel(); // Đóng modal nếu lỗi nghiêm trọng
    } finally {
      setLoadingData(false);
    }
  }, [chapterId, isModalOpen, form, onCancel]);

  useEffect(() => {
    if (isModalOpen && chapterId) {
        fetchChapterDetails();
    }
  }, [isModalOpen, chapterId, fetchChapterDetails]);

  // Hàm xử lý cập nhật chương
  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await authAxios.patch(`/admin/chapters/${chapterId}`, values);
      message.success("Cập nhật chương thành công!");
      onSuccess(); // Gọi callback để làm mới dữ liệu và đóng modal
    } catch (error) {
      console.error("Lỗi API:", error);
      message.error(
        error.response?.data?.message || "Không thể cập nhật chương! Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
      form.resetFields();
      onCancel();
  }

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <EditOutlined style={{ marginRight: 8 }} /> Cập nhật chương ID: {chapterId}
        </Title>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button
          key="restore"
          icon={<ReloadOutlined />}
          onClick={fetchChapterDetails}
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
          {/* Tên chương */}
          <Form.Item
            label="Tên chương"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên chương!" }]}
          >
            <Input placeholder="Ví dụ: Giới thiệu về OOP" />
          </Form.Item>

          {/* Mã môn học (Thường chỉ là hiển thị, không cho sửa SubjectId của Chapter) */}
          <Form.Item
            label="Mã môn học (Subject ID)"
            name="subjectId"
            tooltip="Mã môn học không nên thay đổi sau khi chương được tạo."
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="ID môn học"
              min={1}
              disabled // Khóa không cho người dùng sửa Subject ID
            />
          </Form.Item>

          {/* Số chương */}
          <Form.Item
            label="Số chương"
            name="chapterNumber"
            rules={[{ required: true, message: "Vui lòng nhập số chương!" }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Ví dụ: 1"
              min={1}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default UpdateChapterModal;