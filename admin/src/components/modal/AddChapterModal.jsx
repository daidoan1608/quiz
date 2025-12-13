import React, { useEffect, useState, useCallback } from "react";
import {
  Form,
  Input,
  Button,
  Modal,
  Select,
  InputNumber,
  message,
  Typography,
  Divider,
  Space,
  Row,
  Col,
} from "antd";
import { SaveOutlined, BookOutlined, ReloadOutlined } from "@ant-design/icons";
import { authAxios } from "../../api/axiosConfig"; // Điều chỉnh đường dẫn nếu cần

const { Title } = Typography;
const { Option } = Select;

const AddChapterModal = ({ isModalOpen, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // State lưu dữ liệu
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]); // Danh sách môn học (đổi theo khoa)
  const [isSubjectDisabled, setIsSubjectDisabled] = useState(true); // Khóa ô môn học khi chưa chọn khoa

  // Lấy danh sách Khoa
  const fetchCategories = useCallback(async () => {
    try {
      const response = await authAxios.get("/public/categories");
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data];
      const finalData = Array.isArray(data[0]) ? data[0] : data;
      setCategories(finalData);
    } catch (error) {
      console.error("Lỗi:", error);
      message.error("Không thể lấy danh sách khoa!");
    }
  }, []);

  useEffect(() => {
    if (isModalOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isModalOpen, categories.length, fetchCategories]);

  // Xử lý khi người dùng chọn Khoa
  const handleCategoryChange = (categoryId) => {
    // 1. Reset ô môn học trong Form
    form.setFieldsValue({ subjectId: null });

    // 2. Tìm khoa tương ứng để lấy danh sách môn
    const selectedCategory = categories.find(
      (c) => c.categoryId === categoryId
    );

    if (selectedCategory && selectedCategory.subjects) {
      setSubjects(selectedCategory.subjects);
      setIsSubjectDisabled(false); // Mở khóa ô môn học
    } else {
      setSubjects([]);
      setIsSubjectDisabled(true);
    }
  };

  // Xử lý submit form
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // payload chỉ cần 3 trường: name, subjectId, chapterNumber
      const payload = {
        name: values.name,
        subjectId: values.subjectId,
        chapterNumber: values.chapterNumber,
      };

      await authAxios.post("/admin/chapters", payload);
      message.success("Thêm chương thành công!");

      // Reset form và đóng modal
      form.resetFields();
      setIsSubjectDisabled(true);
      setSubjects([]);
      onSuccess();
    } catch (error) {
      console.error("Lỗi:", error);
      message.error(
        error.response?.data?.message ||
          "Thêm chương thất bại! Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsSubjectDisabled(true);
    setSubjects([]);
    onCancel();
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <BookOutlined style={{ marginRight: 8 }} /> Thêm Chương Mới
        </Title>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button
          key="reset"
          icon={<ReloadOutlined />}
          onClick={() => form.resetFields()}
        >
          Làm mới
        </Button>,
        <Button key="back" onClick={handleCancel}>
          Hủy bỏ
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={() => form.submit()}
        >
          Lưu Chương
        </Button>,
      ]}
      width={700}
      centered
    >
      <Divider style={{ margin: "16px 0" }} />
      <Form form={form} layout="vertical" onFinish={onFinish} size="large">
        <Row gutter={24}>
          {/* Cột trái: Chọn Khoa & Môn */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Chọn Khoa"
              name="categoryId"
              rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}
            >
              <Select
                placeholder="-- Chọn Khoa --"
                onChange={handleCategoryChange}
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

            <Form.Item
              label="Chọn Môn Học"
              name="subjectId"
              rules={[{ required: true, message: "Vui lòng chọn môn học!" }]}
            >
              <Select
                placeholder={
                  isSubjectDisabled
                    ? "Vui lòng chọn Khoa trước"
                    : "-- Chọn Môn Học --"
                }
                disabled={isSubjectDisabled}
                showSearch
                optionFilterProp="children"
              >
                {subjects.map((sub) => (
                  <Option key={sub.subjectId} value={sub.subjectId}>
                    {sub.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Cột phải: Thông tin chương */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Tên Chương"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên chương!" }]}
            >
              <Input placeholder="Ví dụ: Giới thiệu về Java" />
            </Form.Item>

            <Form.Item
              label="Chương số"
              name="chapterNumber"
              rules={[{ required: true, message: "Vui lòng nhập số chương!" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={1}
                placeholder="Ví dụ: 1"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddChapterModal;
