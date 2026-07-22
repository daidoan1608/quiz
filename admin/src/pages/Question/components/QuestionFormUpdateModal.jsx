import React, { useEffect } from "react";
import {
  Alert,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
} from "antd";
import { CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
import {
  AdminCancelButton,
  AdminSaveButton,
} from "../../../components/common/buttons/AdminButtons";
import AdminReadonlyField from "../../../components/common/forms/AdminReadonlyField";
import { useQuestionImageUpload } from "../hooks/useQuestionImageUpload";
import { useQuestionUpdateForm } from "../hooks/useQuestionUpdateForm";
import AdminTableSwitch from "../../../components/common/table/AdminTableSwitch";
import { MarkdownPreviewBox } from "./MarkdownPreviewBox";
import { QuestionAnswerFields } from "./QuestionAnswerFields";
import { QuestionImageField } from "./QuestionImageField";
import AdminModalFormShell from "../../../components/common/modal/AdminModalFormShell";
import AdminLoadingState from "../../../components/common/states/AdminLoadingState";

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
    <AdminModalFormShell
      title="Cập nhật câu hỏi"
      icon={<EditOutlined />}
      open={isModalOpen}
      onCancel={onCancel}
      loading={loadingData}
      loadingRows={6}
      footer={[
        <AdminCancelButton key="back" onClick={onCancel} />,
        <AdminSaveButton
          key="submit"
          loading={submitting}
          disabled={submitting || uploadingImage}
          onClick={() => form.submit()}
        >
          Lưu
        </AdminSaveButton>,
      ]}
      width={800}
      centered
      maskClosable={false}
    >
      <Form form={form} layout="vertical" onFinish={submitQuestion} size="large">
          <AdminReadonlyField name="questionId" />

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
            className="question-form-answer-alert"
            message={
              questionType === "SINGLE_CHOICE"
                ? "Chọn một đáp án đúng bằng nút Radio."
                : "Chọn một hoặc nhiều đáp án đúng bằng nút Checkbox."
            }
            type="info"
            showIcon
          />

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item label="Dùng trong đề thi" name="examEnabled" valuePropName="checked">
                <AdminTableSwitch />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Hiện trong ôn tập" name="practiceEnabled" valuePropName="checked">
                <AdminTableSwitch />
              </Form.Item>
            </Col>
          </Row>

          <QuestionAnswerFields
            questionType={questionType}
            correctAnswers={correctAnswers}
            setCorrectAnswers={setCorrectAnswers}
          />
      </Form>
    </AdminModalFormShell>
  );
};

export default QuestionFormUpdateModal;
