import React from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Row,
  Select,
  Skeleton,
  Space,
  Switch,
  Typography,
} from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import MarkdownLatexEditor from "../../components/common/MarkdownLatexEditor";
import { QuestionAnswerFields } from "./components/QuestionAnswerFields";
import { QuestionImageField } from "./components/QuestionImageField";
import { useQuestionImageUpload } from "./hooks/useQuestionImageUpload";
import { useQuestionUpdateForm } from "./hooks/useQuestionUpdateForm";

const { Title } = Typography;
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
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
          Quay lại
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          <EditOutlined /> Cập nhật câu hỏi #{questionId}
        </Title>
      </Space>

      <Card bordered={false}>
        {loadingData ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <Form form={form} layout="vertical" onFinish={submitQuestion} size="large">
            <Row gutter={24}>
              <Col xs={24} lg={14}>
                <Form.Item label="Nội dung câu hỏi" name="content" rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}>
                  <MarkdownLatexEditor placeholder="Nhập câu hỏi, công thức LaTeX hoặc Markdown..." minRows={8} maxRows={18} />
                </Form.Item>
              </Col>
              <Col xs={24} lg={10}>
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
              <Col xs={24} md={8}>
                <Form.Item label="Loại câu hỏi" name="questionType" rules={[{ required: true }]}>
                  <Select onChange={handleQuestionTypeChange}>
                    <Option value="SINGLE_CHOICE">Trắc nghiệm chọn một</Option>
                    <Option value="MULTIPLE_CHOICE">Trắc nghiệm chọn nhiều</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Mức độ" name="difficulty" rules={[{ required: true, message: "Chọn mức độ!" }]}>
                  <Select>
                    <Option value="EASY">Dễ</Option>
                    <Option value="MEDIUM">Trung bình</Option>
                    <Option value="HARD">Khó</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item label="Dùng trong đề thi" name="examEnabled" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item label="Hiện trong ôn tập" name="practiceEnabled" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left"><CheckCircleOutlined /> Chỉnh sửa đáp án</Divider>
            <Alert
              message={questionType === "SINGLE_CHOICE" ? "Chọn một đáp án đúng." : "Có thể chọn nhiều đáp án đúng."}
              type="info"
              showIcon
              style={{ marginBottom: 20 }}
            />
            <QuestionAnswerFields
              questionType={questionType}
              correctAnswers={correctAnswers}
              setCorrectAnswers={setCorrectAnswers}
            />
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={goBack}>Hủy bỏ</Button>
              <Button type="primary" icon={<SaveOutlined />} loading={submitting} onClick={() => form.submit()}>
                Lưu thay đổi
              </Button>
            </Space>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default QuestionUpdatePage;
