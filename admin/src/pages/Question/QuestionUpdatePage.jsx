import React from "react";
import {
  Alert,
  Col,
  Divider,
  Form,
  Row,
  Select,
  Space,
} from "antd";
import { CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  AdminFormActions,
} from "../../components/common/forms/AdminFormActions";
import AdminFormSection from "../../components/common/forms/AdminFormSection";
import AdminFormPageLayout from "../../components/common/layout/AdminFormPageLayout";
import AdminLoadingState from "../../components/common/states/AdminLoadingState";
import AdminTableSwitch from "../../components/common/table/AdminTableSwitch";
import MarkdownLatexEditor from "../../components/common/MarkdownLatexEditor";
import { QuestionAnswerFields } from "./components/QuestionAnswerFields";
import { QuestionImageField } from "./components/QuestionImageField";
import { useQuestionImageUpload } from "./hooks/useQuestionImageUpload";
import { useQuestionUpdateForm } from "./hooks/useQuestionUpdateForm";

const { Option } = Select;

const QuestionUpdatePage = () => {
  const [form] = Form.useForm();
  const { questionId } = useParams();
  const navigate = useNavigate();
  const goBack = () => navigate("/questions");
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
  } = useQuestionUpdateForm({
    form,
    isModalOpen: true,
    onCancel: goBack,
    onSuccess: goBack,
    questionId,
  });
  const { uploadingImage, handleUploadImage } = useQuestionImageUpload({
    form,
    setPreviewImgUrl,
  });

  return (
    <AdminFormPageLayout
      onBack={goBack}
      title={<><EditOutlined /> Cập nhật câu hỏi #{questionId}</>}
    >
      {loadingData ? (
        <AdminLoadingState card skeleton rows={8} />
      ) : (
          <Form form={form} layout="vertical" onFinish={submitQuestion} size="middle">
            <Space className="question-form-stack" direction="vertical" size={16}>
              <AdminFormSection>
                <Row gutter={16}>
                  <Col xs={24} md={12} xl={6}>
                    <Form.Item label="Loại câu hỏi" name="questionType" rules={[{ required: true }]}>
                      <Select onChange={handleQuestionTypeChange}>
                        <Option value="SINGLE_CHOICE">Trắc nghiệm chọn một</Option>
                        <Option value="MULTIPLE_CHOICE">Trắc nghiệm chọn nhiều</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12} xl={6}>
                    <Form.Item label="Mức độ" name="difficulty" rules={[{ required: true, message: "Chọn mức độ!" }]}>
                      <Select>
                        <Option value="EASY">Dễ</Option>
                        <Option value="MEDIUM">Trung bình</Option>
                        <Option value="HARD">Khó</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={8} xl={4}>
                    <Form.Item label="Dùng trong đề thi" name="examEnabled" valuePropName="checked">
                      <AdminTableSwitch />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={8} xl={4}>
                    <Form.Item label="Hiện trong ôn tập" name="practiceEnabled" valuePropName="checked">
                      <AdminTableSwitch />
                    </Form.Item>
                  </Col>
                </Row>
              </AdminFormSection>

              <Row gutter={16}>
                <Col xs={24} xl={16}>
                  <AdminFormSection title="Nội dung câu hỏi">
                    <Form.Item className="question-form-content-item" name="content" rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}>
                      <MarkdownLatexEditor placeholder="Nhập câu hỏi, công thức LaTeX hoặc Markdown..." minRows={7} maxRows={16} />
                    </Form.Item>
                  </AdminFormSection>
                </Col>
                <Col xs={24} xl={8}>
                  <AdminFormSection title="Ảnh minh họa">
                    <QuestionImageField
                      form={form}
                      imageType={imageType}
                      setImageType={setImageType}
                      previewImgUrl={previewImgUrl}
                      setPreviewImgUrl={setPreviewImgUrl}
                      uploadingImage={uploadingImage}
                      handleUploadImage={handleUploadImage}
                    />
                  </AdminFormSection>
                </Col>
              </Row>

              <AdminFormSection>
                <Divider className="question-form-answer-divider" orientation="left"><CheckCircleOutlined /> Chỉnh sửa đáp án</Divider>
                <Alert
                  className="question-form-answer-alert"
                  message={questionType === "SINGLE_CHOICE" ? "Chọn một đáp án đúng." : "Có thể chọn nhiều đáp án đúng."}
                  type="info"
                  showIcon
                />
                <QuestionAnswerFields
                  questionType={questionType}
                  correctAnswers={correctAnswers}
                  setCorrectAnswers={setCorrectAnswers}
                />
              </AdminFormSection>

              <AdminFormActions
                sticky
                loading={submitting}
                disabled={submitting || uploadingImage}
                onCancel={goBack}
                onSubmit={() => form.submit()}
              />
            </Space>
          </Form>
      )}
    </AdminFormPageLayout>
  );
};

export default QuestionUpdatePage;
