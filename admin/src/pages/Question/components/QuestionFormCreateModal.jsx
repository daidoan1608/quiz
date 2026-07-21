import React, { useEffect, useState } from 'react';
import {
  Form, Input, Select,
  Typography, Divider,
  Row, Col, Alert, Modal
} from 'antd';
import {
  QuestionCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import {
  AdminCancelButton,
  AdminSaveButton,
} from '../../../components/common/buttons/AdminButtons';
import { QUESTION_FORM_INITIAL_VALUES } from '../constants';
import { useQuestionCreateForm } from '../hooks/useQuestionCreateForm';
import { useQuestionImageUpload } from '../hooks/useQuestionImageUpload';
import AdminTableSwitch from '../../../components/common/table/AdminTableSwitch';
import { MarkdownPreviewBox } from './MarkdownPreviewBox';
import { QuestionAnswerFields } from './QuestionAnswerFields';
import { QuestionImageField } from './QuestionImageField';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const QuestionFormCreateModal = ({ isModalOpen, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [imageType, setImageType] = useState('upload');
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
  } = useQuestionCreateForm({ form, isModalOpen, onCancel, onSuccess });
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
          <QuestionCircleOutlined style={{ marginRight: 8 }} /> Thêm Câu Hỏi Mới
        </Title>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <AdminCancelButton key="back" onClick={handleCancel} />,
        <AdminSaveButton
          key="submit"
          loading={loading}
          onClick={() => form.submit()}
          size="large"
        >
          Lưu
        </AdminSaveButton>,
      ]}
      width={900}
      centered
      maskClosable={false}
    >
      <Divider style={{ margin: '16px 0' }} />
      <Form
        form={form}
        layout="vertical"
        onFinish={submitQuestion}
        size="large"
        initialValues={QUESTION_FORM_INITIAL_VALUES}
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
                placeholder={subjects.length === 0 ? "Vui lòng chọn khoa trước" : "-- Chọn môn --"}
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
                placeholder={chapters.length === 0 ? "Vui lòng chọn môn trước" : "-- Chọn chương --"}
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
          <Col xs={24} md={12}>
            <Form.Item
              label="Nội dung câu hỏi"
              name="content"
              rules={[{ required: true, message: "Nhập nội dung câu hỏi!" }]}
            >
              <TextArea rows={3} placeholder="Nhập câu hỏi (hỗ trợ LaTeX)..." />
            </Form.Item>
            <MarkdownPreviewBox
              content={content}
              label="Xem trước nội dung câu hỏi:"
            />
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
            <Form.Item
              label="Loại câu hỏi"
              name="questionType"
              rules={[{ required: true }]}
            >
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
          message={
            questionType === 'SINGLE_CHOICE'
              ? "Nhập 4 đáp án và tích chọn vào ô tròn cạnh đáp án đúng."
              : "Nhập 4 đáp án và tích chọn các ô vuông cạnh các đáp án đúng."
          }
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
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
          requiredMessage={(label) => `Nhập đáp án ${label}!`}
          correctColor="var(--admin-success)"
        />
      </Form>
    </Modal>
  );
};

export default QuestionFormCreateModal;
