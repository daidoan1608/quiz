import React, { useEffect, useState, useCallback } from "react";
import {
  Form, Input, Button, Modal, Select, Radio,
  message, Typography, Divider, Skeleton, Row, Col, Space,
} from "antd";
import {
  SaveOutlined, EditOutlined, CheckCircleOutlined,
} from "@ant-design/icons";
import { authAxios } from "../../api/axiosConfig"; // Điều chỉnh đường dẫn nếu cần

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const UpdateQuestionModal = ({ isModalOpen, onCancel, onSuccess, questionId }) => {
  const [form] = Form.useForm();

  // State quản lý
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State lưu index của đáp án đúng hiện tại
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);

  // State lưu mảng đáp án gốc (để giữ lại optionId khi gửi cập nhật)
  const [originalAnswers, setOriginalAnswers] = useState([]);

  const fetchQuestion = useCallback(async () => {
    if (!questionId || !isModalOpen) {
        setLoadingData(true);
        return;
    }
    setLoadingData(true);
    try {
      const response = await authAxios.get(`/admin/questions/${questionId}`);
      const data = response.data.data;

      // 1. Tìm index của đáp án đúng
      const correctIdx = data.answers.findIndex((ans) => ans.isCorrect);
      setCorrectAnswerIndex(correctIdx !== -1 ? correctIdx : null);

      // 2. Lưu đáp án gốc để lấy optionId sau này
      setOriginalAnswers(data.answers);

      // 3. Đổ dữ liệu vào Form
      const formData = {
        content: data.content,
        difficulty: data.difficulty,
        answer_0: data.answers[0]?.content,
        answer_1: data.answers[1]?.content,
        answer_2: data.answers[2]?.content,
        answer_3: data.answers[3]?.content,
      };

      form.setFieldsValue(formData);
    } catch (error) {
      console.error("Error:", error);
      message.error("Không thể tải thông tin câu hỏi!");
      onCancel(); // Đóng modal nếu tải thất bại
    } finally {
      setLoadingData(false);
    }
  }, [questionId, isModalOpen, form, onCancel]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const onFinish = async (values) => {
    if (correctAnswerIndex === null) {
      message.error("Vui lòng chọn đáp án đúng!");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Tái cấu trúc mảng answers, giữ nguyên optionId cũ
      const updatedAnswers = originalAnswers.map((ans, index) => ({
        optionId: ans.optionId, // Quan trọng: Giữ ID để backend update đúng record
        content: values[`answer_${index}`], // Lấy nội dung mới từ form
        isCorrect: index === correctAnswerIndex, // Cập nhật trạng thái đúng/sai
      }));

      // 2. Tạo payload
      const payload = {
        questionId: Number(questionId),
        content: values.content,
        difficulty: values.difficulty,
        answers: updatedAnswers,
      };

      await authAxios.patch(`/admin/questions/${questionId}`, payload);
      message.success("Cập nhật câu hỏi thành công!");
      onSuccess(); // Đóng modal và làm mới dữ liệu
    } catch (error) {
      console.error("Error:", error);
      message.error(
        error.response?.data?.message || "Cập nhật thất bại! Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Không cần resetFields vì dữ liệu sẽ được load lại khi modal mở
    onCancel();
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <EditOutlined style={{ marginRight: 8 }} /> Cập nhập câu hỏi ID: {questionId}
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
          loading={submitting}
          onClick={() => form.submit()}
        >
          Lưu thay đổi
        </Button>,
      ]}
      width={800}
      centered
      maskClosable={false}
    >
      <Divider style={{ margin: '16px 0' }} />
      {loadingData ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          {/* Nội dung & Mức độ */}
          <Row gutter={24}>
            <Col xs={24} md={18}>
              <Form.Item
                label="Nội dung câu hỏi"
                name="content"
                rules={[
                  { required: true, message: "Vui lòng nhập nội dung!" },
                ]}
              >
                <TextArea rows={2} placeholder="Nhập câu hỏi..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Mức độ"
                name="difficulty"
                rules={[{ required: true, message: "Chọn mức độ!" }]}
              >
                <Select>
                  <Option value="EASY">Dễ</Option>
                  <Option value="MEDIUM">Trung bình</Option>
                  <Option value="HARD">Khó</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">
            <CheckCircleOutlined /> Chỉnh sửa đáp án
          </Divider>

          {/* Danh sách đáp án */}
          <Radio.Group
            value={correctAnswerIndex}
            onChange={(e) => setCorrectAnswerIndex(e.target.value)}
            style={{ width: "100%" }}
          >
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                {/* Radio chọn đúng sai */}
                <Radio value={index} style={{ marginRight: 12 }}>
                  <Text
                    strong
                    style={{
                      color:
                        correctAnswerIndex === index ? "#52c41a" : "inherit",
                    }}
                  >
                    Đáp án {String.fromCharCode(65 + index)}
                  </Text>
                </Radio>

                {/* Input nội dung đáp án */}
                <Form.Item
                  name={`answer_${index}`}
                  rules={[
                    { required: true, message: "Không được để trống!" },
                  ]}
                  style={{ margin: 0, flex: 1 }}
                >
                  <Input
                    placeholder={`Nhập đáp án ${String.fromCharCode(
                      65 + index
                    )}`}
                    style={{
                      borderColor:
                        correctAnswerIndex === index ? "#52c41a" : undefined,
                      backgroundColor:
                        correctAnswerIndex === index ? "#f6ffed" : undefined,
                    }}
                  />
                </Form.Item>
              </div>
            ))}
          </Radio.Group>
        </Form>
      )}
    </Modal>
  );
};

export default UpdateQuestionModal;