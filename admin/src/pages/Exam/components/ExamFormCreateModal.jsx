import React from "react";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import { ControlOutlined, FileAddOutlined, SaveOutlined } from "@ant-design/icons";
import {
  cancelModalButtonStyle,
  primaryModalButtonStyle,
} from "../../../utils/ui/antdModalButtonStyles";
import { useExamCreateForm } from "../hooks/useExamCreateForm";
import { ExamGenerationControls } from "./ExamGenerationControls";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ExamFormCreateModal = ({ isModalOpen, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const {
    calculateTotalSelected,
    categories,
    generationMode,
    handleCancel,
    handleCategoryChange,
    handleSubjectChange,
    inputChapters,
    inputDiff,
    inputTotal,
    loading,
    manualFilters,
    manualPickerLoading,
    manualQuestionIds,
    manualQuestionPage,
    manualQuestionTotal,
    manualQuestions,
    maxQuestions,
    selectedSubject,
    setGenerationMode,
    setInputChapters,
    setInputDiff,
    setInputTotal,
    setManualFilters,
    setManualQuestionIds,
    setManualQuestionPage,
    subjects,
    submitExam,
  } = useExamCreateForm({ form, isModalOpen, onCancel, onSuccess });

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <FileAddOutlined style={{ marginRight: 8 }} /> Tạo Đề Thi Mới
        </Title>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="back" style={cancelModalButtonStyle} onClick={handleCancel}>Hủy bỏ</Button>,
        <Button
          key="submit"
          type="default"
          style={primaryModalButtonStyle}
          icon={<SaveOutlined />}
          loading={loading}
          onClick={() => form.submit()}
          size="large"
        >
          Tạo Đề Thi
        </Button>,
      ]}
      width={900}
      centered
    >
      <Divider style={{ margin: "16px 0" }} />
      <Form form={form} layout="vertical" onFinish={submitExam} size="large">
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Chọn Khoa"
              name="categoryId"
              rules={[{ required: true, message: "Chọn khoa!" }]}
            >
              <Select
                placeholder="-- Chọn khoa --"
                onChange={handleCategoryChange}
                showSearch
                optionFilterProp="children"
              >
                {categories.map((category) => (
                  <Option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Chọn Môn Học"
              name="subjectId"
              rules={[{ required: true, message: "Chọn môn!" }]}
            >
              <Select
                placeholder={subjects.length === 0 ? "Vui lòng chọn khoa trước" : "-- Chọn môn --"}
                onChange={handleSubjectChange}
                disabled={subjects.length === 0}
                showSearch
                optionFilterProp="children"
              >
                {subjects.map((subject) => (
                  <Option key={subject.subjectId} value={subject.subjectId}>
                    {subject.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Ma de" name="examCode">
          <Input placeholder="VD: JAVA-CK-001" />
        </Form.Item>

        <Form.Item
          label="Tên bài thi"
          name="title"
          rules={[{ required: true, message: "Nhập tên bài thi!" }]}
        >
          <Input placeholder="Ví dụ: Thi cuối kỳ Java - Đề 1" />
        </Form.Item>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Thời gian làm bài (phút)"
              name="duration"
              rules={[{ required: true, message: "Nhập thời gian!" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} placeholder="Ví dụ: 60" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Mô tả" name="description">
              <TextArea rows={1} placeholder="Ghi chú thêm..." />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">
          <ControlOutlined /> Cấu hình câu hỏi
        </Divider>

        <ExamGenerationControls
          selectedSubject={selectedSubject}
          generationMode={generationMode}
          setGenerationMode={setGenerationMode}
          maxQuestions={maxQuestions}
          inputTotal={inputTotal}
          setInputTotal={setInputTotal}
          inputDiff={inputDiff}
          setInputDiff={setInputDiff}
          inputChapters={inputChapters}
          setInputChapters={setInputChapters}
          manualFilters={manualFilters}
          manualPickerLoading={manualPickerLoading}
          manualQuestionIds={manualQuestionIds}
          manualQuestionPage={manualQuestionPage}
          manualQuestionTotal={manualQuestionTotal}
          manualQuestions={manualQuestions}
          setManualFilters={setManualFilters}
          setManualQuestionIds={setManualQuestionIds}
          setManualQuestionPage={setManualQuestionPage}
          calculateTotalSelected={calculateTotalSelected}
        />
      </Form>
    </Modal>
  );
};

export default ExamFormCreateModal;
