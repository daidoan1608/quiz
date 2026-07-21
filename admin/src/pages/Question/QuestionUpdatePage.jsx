import React from "react";
import {
  Alert,
  Card,
  Col,
  Divider,
  Form,
  Row,
  Select,
  Skeleton,
  Space,
  Typography,
} from "antd";
import { CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  AdminCancelButton,
  AdminSaveButton,
} from "../../components/common/buttons/AdminButtons";
import MainBackButton from "../../components/common/MainBackButton";
import AdminTableSwitch from "../../components/common/table/AdminTableSwitch";
import MarkdownLatexEditor from "../../components/common/MarkdownLatexEditor";
import { QuestionAnswerFields } from "./components/QuestionAnswerFields";
import { QuestionImageField } from "./components/QuestionImageField";
import { useQuestionImageUpload } from "./hooks/useQuestionImageUpload";
import { useQuestionUpdateForm } from "./hooks/useQuestionUpdateForm";

const { Title } = Typography;
const { Option } = Select;

const actionBarStyle = {
  position: "sticky",
  bottom: 0,
  zIndex: 8,
  display: "flex",
  justifyContent: "flex-end",
  padding: "12px 0 0",
  background: "var(--admin-bg)",
};

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
    <div style={{ padding: 24 }}>
      <MainBackButton onClick={goBack} />

      <Space style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <EditOutlined /> Cập nhật câu hỏi #{questionId}
        </Title>
      </Space>

      {loadingData ? (
        <Card variant="borderless">
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      ) : (
          <Form form={form} layout="vertical" onFinish={submitQuestion} size="middle">
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Card variant="borderless" size="small">
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
              </Card>

              <Row gutter={16}>
                <Col xs={24} xl={16}>
                  <Card variant="borderless" size="small" title="Nội dung câu hỏi">
                    <Form.Item name="content" rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]} style={{ marginBottom: 0 }}>
                      <MarkdownLatexEditor placeholder="Nhập câu hỏi, công thức LaTeX hoặc Markdown..." minRows={7} maxRows={16} />
                    </Form.Item>
                  </Card>
                </Col>
                <Col xs={24} xl={8}>
                  <Card variant="borderless" size="small" title="Ảnh minh họa">
                    <QuestionImageField
                      form={form}
                      imageType={imageType}
                      setImageType={setImageType}
                      previewImgUrl={previewImgUrl}
                      setPreviewImgUrl={setPreviewImgUrl}
                      uploadingImage={uploadingImage}
                      handleUploadImage={handleUploadImage}
                    />
                  </Card>
                </Col>
              </Row>

              <Card variant="borderless" size="small">
                <Divider orientation="left" style={{ marginTop: 0 }}><CheckCircleOutlined /> Chỉnh sửa đáp án</Divider>
                <Alert
                  message={questionType === "SINGLE_CHOICE" ? "Chọn một đáp án đúng." : "Có thể chọn nhiều đáp án đúng."}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <QuestionAnswerFields
                  questionType={questionType}
                  correctAnswers={correctAnswers}
                  setCorrectAnswers={setCorrectAnswers}
                />
              </Card>

              <div style={actionBarStyle}>
                <Space>
                  <AdminCancelButton onClick={goBack} />
                  <AdminSaveButton
                    loading={submitting}
                    disabled={submitting || uploadingImage}
                    onClick={() => form.submit()}
                  >
                    Lưu
                  </AdminSaveButton>
                </Space>
              </div>
            </Space>
          </Form>
      )}
    </div>
  );
};

export default QuestionUpdatePage;
