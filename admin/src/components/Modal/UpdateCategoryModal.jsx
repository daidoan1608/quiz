import React, { useEffect, useState } from "react";
import {
  Form, Input, Button, Modal,
  Typography, message, Divider, Skeleton
} from "antd";
import {
  SaveOutlined, EditOutlined
} from "@ant-design/icons";
import { categoryApi } from "../../api/services"; // Điều chỉnh đường dẫn nếu cần

const { Title } = Typography;
const { TextArea } = Input;

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

const UpdateCategoryModal = ({ isModalOpen, onCancel, onSuccess, categoryId }) => {
  const [form] = Form.useForm();

  // State quản lý trạng thái
  const [loading, setLoading] = useState(true); // Loading khi lấy dữ liệu
  const [submitting, setSubmitting] = useState(false); // Loading khi lưu

  // Lấy thông tin category ban đầu
  useEffect(() => {
    if (!isModalOpen || !categoryId) {
        setLoading(true);
        return;
    }

    const getCategoryDetails = async () => {
      setLoading(true);
      try {
        const data = await categoryApi.getById(categoryId);
        form.setFieldsValue(data);
      } catch (error) {
        console.error("Lỗi:", error);
        message.error("Không thể lấy thông tin thể loại!");
        onCancel(); // Đóng modal nếu lỗi nghiêm trọng
      } finally {
        setLoading(false);
      }
    };

    getCategoryDetails();
  }, [categoryId, form, isModalOpen, onCancel]);

  // Xử lý khi submit form
  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await categoryApi.update(categoryId, values);
      message.success("Cập nhật khoa thành công!");
      onSuccess(); // Đóng modal và làm mới danh sách
    } catch (error) {
      console.error("Lỗi:", error);
      message.error(
        error.response?.data?.message || "Không thể cập nhật thể loại!"
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
          <EditOutlined style={{ marginRight: 8 }} /> Cập Nhật Khoa: {categoryId}
        </Title>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="back" style={cancelButtonStyle} onClick={handleCancel}>Hủy bỏ</Button>,
        <Button
          type="default"
          style={primaryButtonStyle}
          key="submit"
          icon={<SaveOutlined />}
          loading={submitting}
          onClick={() => form.submit()}
        >
          Lưu thay đổi
        </Button>,
      ]}
      width={500}
      centered
      maskClosable={false} // Không cho đóng khi click ra ngoài trong khi tải
    >
      <Divider style={{ margin: '16px 0' }} />
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          {/* Tên khoa */}
          <Form.Item
            label="Tên Khoa"
            name="categoryName"
            rules={[
              { required: true, message: "Vui lòng nhập tên khoa!" },
              { min: 3, message: "Tên khoa quá ngắn!" }
            ]}
          >
            <Input placeholder="Nhập tên khoa..." />
          </Form.Item>

          {/* Mô tả */}
          <Form.Item
            label="Mô tả"
            name="categoryDescription"
            rules={[{ required: false, message: "Vui lòng nhập mô tả!" }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập mô tả..."
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default UpdateCategoryModal;
