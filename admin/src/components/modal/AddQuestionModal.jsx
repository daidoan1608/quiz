import React, { useState, useEffect, useCallback } from 'react';
import { authAxios } from '../../api/axiosConfig';
import {
  Form, Input, Button, Card, Select,
  Radio, message, Typography, Divider,
  Row, Col, Alert, Modal
} from 'antd';
import {
  SaveOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AddQuestionModal = ({ isModalOpen, onCancel, onSuccess }) => {
  const [form] = Form.useForm();

  // State data
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  // State loading & UI
  const [loading, setLoading] = useState(false);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null); // Lưu index đáp án đúng

  // 1. Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await authAxios.get("/public/categories");
      const data = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      setCategories(Array.isArray(data[0]) ? data[0] : data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isModalOpen, categories.length, fetchCategories]);

  // 2. Xử lý khi chọn Khoa -> Lọc Môn
  const handleCategoryChange = (categoryId) => {
    // Reset các trường con
    form.setFieldsValue({ subjectId: null, chapterId: null });
    setSubjects([]);
    setChapters([]);

    const selectedCategory = categories.find(cat => cat.categoryId === categoryId);
    if (selectedCategory && selectedCategory.subjects) {
      setSubjects(selectedCategory.subjects);
    }
  };

  // 3. Xử lý khi chọn Môn -> Fetch Chương
  const handleSubjectChange = async (subjectId) => {
    // Reset trường chương
    form.setFieldsValue({ chapterId: null });
    setChapters([]);

    if (!subjectId) return;

    try {
      const response = await authAxios.get(`/public/subjects/${subjectId}`);
      if (response.data.status === 'success') {
        setChapters(response.data.data.chapters || []);
      } else {
        message.warning("Môn học này chưa có chương nào!");
      }
    } catch (error) {
      console.error("Lỗi fetch chương:", error);
      message.error("Không thể tải danh sách chương.");
    }
  };

  // 4. Xử lý Submit Form
  const onFinish = async (values) => {
    // Kiểm tra đã chọn đáp án đúng chưa
    if (correctAnswerIndex === null) {
      message.error("Vui lòng chọn một đáp án đúng!");
      return;
    }

    setLoading(true);
    try {
      // Chuẩn bị mảng answers từ form values
      const formattedAnswers = [
        { content: values.answerA, isCorrect: correctAnswerIndex === 0 },
        { content: values.answerB, isCorrect: correctAnswerIndex === 1 },
        { content: values.answerC, isCorrect: correctAnswerIndex === 2 },
        { content: values.answerD, isCorrect: correctAnswerIndex === 3 },
      ];

      const newQuestion = {
        content: values.content,
        difficulty: values.difficulty,
        subjectId: values.subjectId,
        chapterId: values.chapterId,
        answers: formattedAnswers,
      };

      await authAxios.post("/admin/questions", newQuestion);
      message.success("Thêm câu hỏi thành công!");

      // Reset state và form sau khi thành công
      form.resetFields();
      setCorrectAnswerIndex(null);
      setSubjects([]);
      setChapters([]);
      onSuccess(); // Đóng modal và làm mới dữ liệu

    } catch (error) {
      console.error("Error adding question:", error);
      message.error(
        error.response?.data?.message || "Thêm câu hỏi thất bại! Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
      form.resetFields();
      setCorrectAnswerIndex(null);
      setSubjects([]);
      setChapters([]);
      onCancel();
  }

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <QuestionCircleOutlined style={{ marginRight: 8 }} /> Thêm Câu Hỏi Mới
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
          size="large"
        >
          Lưu Câu Hỏi
        </Button>,
      ]}
      width={900}
      centered
      maskClosable={false}
    >
      <Divider style={{ margin: '16px 0' }} />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        size="large"
        initialValues={{ difficulty: 'MEDIUM' }}
      >
        {/* KHỐI 1: PHÂN LOẠI */}
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Chọn Khoa"
              name="categoryId"
              rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}
            >
              <Select
                placeholder="-- Chọn khoa --"
                onChange={handleCategoryChange}
                showSearch
                optionFilterProp="children"
              >
                {categories.map(cat => (
                  <Option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Chọn Môn"
              name="subjectId"
              rules={[{ required: true, message: "Vui lòng chọn môn!" }]}
            >
              <Select
                placeholder="-- Chọn môn --"
                onChange={handleSubjectChange}
                disabled={subjects.length === 0}
                showSearch
                optionFilterProp="children"
              >
                {subjects.map(sub => (
                  <Option key={sub.subjectId} value={sub.subjectId}>{sub.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Chọn Chương"
              name="chapterId"
              rules={[{ required: true, message: "Vui lòng chọn chương!" }]}
            >
              <Select
                placeholder="-- Chọn chương --"
                disabled={chapters.length === 0}
                showSearch
                optionFilterProp="children"
              >
                {chapters.map(chap => (
                  <Option key={chap.chapterId} value={chap.chapterId}>{chap.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={18}>
            <Form.Item
              label="Nội dung câu hỏi"
              name="content"
              rules={[{ required: true, message: "Nhập nội dung câu hỏi!" }]}
            >
              <TextArea rows={2} placeholder="Nhập câu hỏi..." />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              label="Mức độ"
              name="difficulty"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="EASY">Dễ</Option>
                <Option value="MEDIUM">Trung bình</Option>
                <Option value="HARD">Khó</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left"><CheckCircleOutlined /> Thiết lập đáp án</Divider>

        <Alert
          message="Nhập 4 đáp án và tích chọn vào ô tròn cạnh đáp án đúng."
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />

        {/* KHỐI 2: ĐÁP ÁN */}
        <Radio.Group
          onChange={(e) => setCorrectAnswerIndex(e.target.value)}
          value={correctAnswerIndex}
          style={{ width: '100%' }}
        >
          {['A', 'B', 'C', 'D'].map((label, index) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              {/* Nút chọn đúng sai */}
              <Radio value={index} style={{ marginRight: 16 }}>
                <Text strong style={{ color: correctAnswerIndex === index ? '#52c41a' : 'inherit' }}>
                  Đáp án {label} {correctAnswerIndex === index && "(Đúng)"}
                </Text>
              </Radio>

              {/* Nội dung đáp án */}
              <Form.Item
                name={`answer${label}`}
                rules={[{ required: true, message: `Nhập đáp án ${label}!` }]}
                style={{ margin: 0, flex: 1 }}
              >
                <Input
                  placeholder={`Nội dung đáp án ${label}`}
                  style={{
                    borderColor: correctAnswerIndex === index ? '#52c41a' : undefined,
                    backgroundColor: correctAnswerIndex === index ? '#f6ffed' : undefined
                  }}
                />
              </Form.Item>
            </div>
          ))}
        </Radio.Group>
      </Form>
    </Modal>
  );
};

export default AddQuestionModal;