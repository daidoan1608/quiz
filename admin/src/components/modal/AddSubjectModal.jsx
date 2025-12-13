import React, { useState, useEffect, useCallback } from "react";
import { authAxios } from "../../api/axiosConfig";
import {
  Form, Input, Button, Card, Select,
  Typography, message, Divider, Space, Modal,
} from "antd";
import {
  SaveOutlined,
  ReadOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AddSubjectModal = ({ isModalOpen, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);

  // Lấy danh sách khoa
  const fetchCategories = useCallback(async () => {
    try {
      const response = await authAxios.get("/public/categories");
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data];
      const finalData = Array.isArray(data[0]) ? data[0] : data;
      setCategories(finalData);
    } catch (error) {
      console.error("Lỗi lấy danh sách khoa: ", error);
      message.error("Không thể lấy danh sách khoa!");
    }
  }, []);

  // Fetch categories khi modal mở
  useEffect(() => {
    if (isModalOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isModalOpen, categories.length, fetchCategories]);

  // Xử lý submit form
  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authAxios.post("/admin/subjects", values);
      message.success("Thêm môn học thành công!");

      // Reset form và đóng modal
      form.resetFields();
      onSuccess();

    } catch (error) {
      console.error("Lỗi khi thêm môn học: ", error);
      message.error(
        error.response?.data?.message || "Không thể thêm môn học! Vui lòng thử lại."
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
          <ReadOutlined style={{ marginRight: 8 }} /> Thêm Môn Học
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
        {/* Chọn Khoa */}
        <Form.Item
          label="Chọn Khoa"
          name="categoryId"
          rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}
        >
          <Select
            placeholder="-- Chọn Khoa --"
            showSearch
            optionFilterProp="children"
          >
            {categories.map((cat) => (
              <Option key={cat.categoryId} value={cat.categoryId}>
                {cat.categoryName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Tên môn học */}
        <Form.Item
          label="Tên môn học"
          name="name"
          rules={[
            { required: true, message: "Vui lòng nhập tên môn học!" },
            { min: 3, message: "Tên môn học phải từ 3 ký tự trở lên" },
          ]}
        >
          <Input placeholder="Ví dụ: Cơ sở dữ liệu" />
        </Form.Item>

        {/* Mô tả */}
        <Form.Item label="Mô tả" name="description">
          <TextArea
            rows={4}
            placeholder="Nhập mô tả chi tiết..."
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSubjectModal;