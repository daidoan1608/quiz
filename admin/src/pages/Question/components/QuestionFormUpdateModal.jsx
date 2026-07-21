import React, { useEffect } from "react";
import {
  Alert,
  Button,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Skeleton,
  Switch,
  Typography,
} from "antd";
import { CheckCircleOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import {
  cancelModalButtonStyle,
  primaryModalButtonStyle,
} from "../../../utils/ui/antdModalButtonStyles";
import { useQuestionImageUpload } from "../hooks/useQuestionImageUpload";
import { useQuestionUpdateForm } from "../hooks/useQuestionUpdateForm";
import { MarkdownPreviewBox } from "./MarkdownPreviewBox";
import { QuestionAnswerFields } from "./QuestionAnswerFields";
import { QuestionImageField } from "./QuestionImageField";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const QuestionFormUpdateModal = ({ isModalOpen, onCancel, onSuccess, questionId }) => {
  const [form] = Form.useForm();
  const {
    correctAnswers,
    handleQuestionTypeChange,
    imageType,
    loadingData,
    previewImgUrl,
    questionType,
    setCorrectAnswers,
    setImageType,
    setPreviewImgUrl,
    submitQuestion,
    submitting,
  } = useQuestionUpdateForm({ form, isModalOpen, onCancel, onSuccess, questionId });
  const { uploadingImage, handleUploadImage } = useQuestionImageUpload({
    form,
    setPreviewImgUrl,
  });

  const content = Form.useWatch("content", form);
  const answers = Form.useWatch("answers", form);

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      const timer = setTimeout(() => {
        window.MathJax.typesetPromise();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [content, answers]);

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <EditOutlined style={{ marginRight: 8 }} /> Cập nhật câu hỏi ID: {questionId}
        </Title>
      }
      open={isModalOpen}
      onCancel={onCancel}
      footer={[
        <Button key="back" style={cancelModalButtonStyle} onClick={onCancel}>Hủy bỏ</Button>,
        <Button
          type="default"
          style={primaryModalButtonStyle}
          key="submit"
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
      <Divider style={{ margin: "16px 0" }} />
      {loadingData ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Form form={form} layout="vertical" onFinish={submitQuestion} size="large">
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nội dung câu hỏi"
                name="content"
                rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
              >
                <TextArea rows={3} placeholder="Nhập câu hỏi (hỗ trợ LaTeX)..." />
              </Form.Item>
              <MarkdownPreviewBox content={content} label="Xem trước nội dung câu hỏi:" />
            </Col>
            <Col xs={24} md={12}>
              <QuestionImageField
                form={form}
                imageType={imageType}
                setImageType={setImageType}
                previewImgUrl={previewImgUrl}
                setPreviewImgUrl={setPreviewImgUrl}
                uploadingImage={uploadingImage}
                handleUploadImage={handleUploadImage}
              />
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item label="Loại câu hỏi" name="questionType" rules={[{ required: true }]}>
                <Select onChange={handleQuestionTypeChange}>
                  <Option value="SINGLE_CHOICE">Trắc nghiệm chọn một</Option>
                  <Option value="MULTIPLE_CHOICE">Trắc nghiệm chọn nhiều</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
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

          <Alert
            message={
              questionType === "SINGLE_CHOICE"
                ? "Chọn một đáp án đúng bằng nút Radio."
                : "Chọn một hoặc nhiều đáp án đúng bằng nút Checkbox."
            }
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item label="Dung trong de thi" name="examEnabled" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Hien trong on tap" name="practiceEnabled" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <QuestionAnswerFields
            questionType={questionType}
            correctAnswers={correctAnswers}
            setCorrectAnswers={setCorrectAnswers}
          />
        </Form>
      )}
    </Modal>
  );
};

export default QuestionFormUpdateModal;
