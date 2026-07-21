import React, { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Row,
  Select,
  Space,
  Switch,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import MarkdownLatexEditor from "../../components/common/MarkdownLatexEditor";
import { QUESTION_FORM_INITIAL_VALUES } from "./constants";
import { QuestionAnswerFields } from "./components/QuestionAnswerFields";
import { QuestionImageField } from "./components/QuestionImageField";
import { useQuestionCreateForm } from "./hooks/useQuestionCreateForm";
import { useQuestionImageUpload } from "./hooks/useQuestionImageUpload";

const { Title } = Typography;
const { Option } = Select;

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
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
          Quay lại
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          <QuestionCircleOutlined /> Thêm câu hỏi mới
        </Title>
      </Space>

      <Form
        form={form}
        layout="vertical"
        onFinish={submitQuestion}
        size="large"
        initialValues={QUESTION_FORM_INITIAL_VALUES}
      >
        <Card bordered={false}>
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item label="Khoa" name="categoryId" rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}>
                <Select placeholder="Chọn khoa" onChange={handleCategoryChange} showSearch optionFilterProp="children">
                  {categories.map((cat) => (
                    <Option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Môn" name="subjectId" rules={[{ required: true, message: "Vui lòng chọn môn!" }]}>
                <Select placeholder={subjects.length === 0 ? "Chọn khoa trước" : "Chọn môn"} onChange={handleSubjectChange} disabled={subjects.length === 0} showSearch optionFilterProp="children">
                  {subjects.map((sub) => (
                    <Option key={sub.subjectId} value={sub.subjectId}>{sub.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Chương" name="chapterId" rules={[{ required: true, message: "Vui lòng chọn chương!" }]}>
                <Select placeholder={chapters.length === 0 ? "Chọn môn trước" : "Chọn chương"} disabled={chapters.length === 0} showSearch optionFilterProp="children">
                  {chapters.map((chap) => (
                    <Option key={chap.chapterId} value={chap.chapterId}>{chap.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} lg={14}>
              <Form.Item label="Nội dung câu hỏi" name="content" rules={[{ required: true, message: "Nhập nội dung câu hỏi!" }]}>
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
              <Form.Item label="Mức độ" name="difficulty" rules={[{ required: true }]}>
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

          <Divider orientation="left"><CheckCircleOutlined /> Thiết lập đáp án</Divider>
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
            requiredMessage={(label) => `Nhập đáp án ${label}!`}
            correctColor="#52c41a"
          />
          <Space style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCancel}>Hủy bỏ</Button>
            <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={() => form.submit()}>
              Lưu câu hỏi
            </Button>
          </Space>
        </Card>
      </Form>
    </div>
  );
};

export default QuestionCreatePage;
