import React, { useState } from "react";
import {
  Alert,
  Card,
  Col,
  Divider,
  Form,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  AdminCancelButton,
  AdminSaveButton,
} from "../../components/common/buttons/AdminButtons";
import MainBackButton from "../../components/common/MainBackButton";
import AdminTableSwitch from "../../components/common/table/AdminTableSwitch";
import MarkdownLatexEditor from "../../components/common/MarkdownLatexEditor";
import { QUESTION_FORM_INITIAL_VALUES } from "./constants";
import { QuestionAnswerFields } from "./components/QuestionAnswerFields";
import { QuestionImageField } from "./components/QuestionImageField";
import { useQuestionCreateForm } from "./hooks/useQuestionCreateForm";
import { useQuestionImageUpload } from "./hooks/useQuestionImageUpload";

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

const QuestionCreatePage = () => {
  const [form] = Form.useForm();
  const [imageType, setImageType] = useState("upload");
  const navigate = useNavigate();
  const goBack = () => navigate("/questions");
  const {
    categories,
    chapters,
    correctAnswers,
    handleCancel,
    handleCategoryChange,
    handleQuestionTypeChange,
    handleSubjectChange,
    loading,
    previewImgUrl,
    questionType,
    setCorrectAnswers,
    setPreviewImgUrl,
    subjects,
    submitQuestion,
  } = useQuestionCreateForm({
    form,
    isModalOpen: true,
    onCancel: goBack,
    onSuccess: goBack,
  });
  const { uploadingImage, handleUploadImage } = useQuestionImageUpload({
    form,
    setPreviewImgUrl,
  });

  return (
    <div style={{ padding: 24 }}>
      <MainBackButton onClick={handleCancel} />

      <Space style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <QuestionCircleOutlined /> Thêm câu hỏi mới
        </Title>
      </Space>

      <Form
        form={form}
        layout="vertical"
        onFinish={submitQuestion}
        size="middle"
        initialValues={QUESTION_FORM_INITIAL_VALUES}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Card variant="borderless" size="small">
            <Row gutter={16}>
              <Col xs={24} md={12} xl={6}>
                <Form.Item label="Khoa" name="categoryId" rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}>
                <Select placeholder="Chọn khoa" onChange={handleCategoryChange} showSearch optionFilterProp="children">
                  {categories.map((cat) => (
                    <Option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
              <Col xs={24} md={12} xl={6}>
              <Form.Item label="Môn" name="subjectId" rules={[{ required: true, message: "Vui lòng chọn môn!" }]}>
                <Select placeholder={subjects.length === 0 ? "Chọn khoa trước" : "Chọn môn"} onChange={handleSubjectChange} disabled={subjects.length === 0} showSearch optionFilterProp="children">
                  {subjects.map((sub) => (
                    <Option key={sub.subjectId} value={sub.subjectId}>{sub.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
              <Col xs={24} md={12} xl={6}>
              <Form.Item label="Chương" name="chapterId" rules={[{ required: true, message: "Vui lòng chọn chương!" }]}>
                <Select placeholder={chapters.length === 0 ? "Chọn môn trước" : "Chọn chương"} disabled={chapters.length === 0} showSearch optionFilterProp="children">
                  {chapters.map((chap) => (
                    <Option key={chap.chapterId} value={chap.chapterId}>{chap.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
              <Col xs={24} md={12} xl={6}>
                <Form.Item label="Loại câu hỏi" name="questionType" rules={[{ required: true }]}>
                  <Select onChange={handleQuestionTypeChange}>
                    <Option value="SINGLE_CHOICE">Trắc nghiệm chọn một</Option>
                    <Option value="MULTIPLE_CHOICE">Trắc nghiệm chọn nhiều</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8} xl={6}>
                <Form.Item label="Mức độ" name="difficulty" rules={[{ required: true }]}>
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
                <Form.Item name="content" rules={[{ required: true, message: "Nhập nội dung câu hỏi!" }]} style={{ marginBottom: 0 }}>
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
            <Divider orientation="left" style={{ marginTop: 0 }}><CheckCircleOutlined /> Thiết lập đáp án</Divider>
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
              requiredMessage={(label) => `Nhập đáp án ${label}!`}
              correctColor="var(--admin-success)"
            />
          </Card>

          <div style={actionBarStyle}>
            <Space>
              <AdminCancelButton onClick={handleCancel} />
              <AdminSaveButton loading={loading} onClick={() => form.submit()}>
                Lưu
              </AdminSaveButton>
            </Space>
          </div>
        </Space>
      </Form>
    </div>
  );
};

export default QuestionCreatePage;
