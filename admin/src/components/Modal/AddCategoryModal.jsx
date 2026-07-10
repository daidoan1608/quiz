import React, { useState } from "react";
import {
  Form, Input, Button, Modal,
  Typography, message, Divider,
} from "antd";
import {
  SaveOutlined, AppstoreAddOutlined,
} from "@ant-design/icons";
import { authAxios } from "../../api/axiosConfig"; 

const { Title } = Typography;
const { TextArea } = Input;

const AddCategoryModal = ({ isModalOpen, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authAxios.post("/admin/categories", values);
      message.success("Thêm khoa mới thành công!");
      form.resetFields(); // Reset form sau khi thành công
      onSuccess(); // Đóng modal và làm mới danh sách
    } catch (error) {
      console.error("Lỗi:", error);
      message.error(
        error.response?.data?.message || "Không thể thêm khoa! Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <AppstoreAddOutlined style={{ marginRight: 8 }} /> Thêm Khoa Mới
        </Title>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>Hủy bỏ</Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={() => form.submit()}
        >
          Lưu
        </Button>,
      ]}
      width={500}
      centered
    >
      <Divider style={{ margin: '16px 0' }} />
      <Form form={form} layout="vertical" onFinish={onFinish} size="large">
        {/* Tên khoa */}
        <Form.Item
          label="Tên khoa"
          name="categoryName"
          rules={[
            { required: true, message: "Vui lòng nhập tên khoa!" },
            { min: 3, message: "Tên khoa phải từ 3 ký tự trở lên" },
          ]}
        >
          <Input placeholder="Ví dụ: Công nghệ thông tin" />
        </Form.Item>

        {/* Mô tả */}
        <Form.Item label="Mô tả" name="categoryDescription">
          <TextArea
            rows={4}
            placeholder="Nhập mô tả chi tiết về khoa..."
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;