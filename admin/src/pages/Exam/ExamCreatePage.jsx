import React from "react";
import {
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
} from "antd";
import { FileAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AdminFormPageLayout from "../../components/common/layout/AdminFormPageLayout";
import { AdminFilterSelect } from "../../components/common/filters/AdminFilterControls";
import { useExamCreateForm } from "./hooks/useExamCreateForm";
import { ExamGenerationControls } from "./components/ExamGenerationControls";
import { ExamQuestionConfigHeader } from "./components/ExamQuestionConfigHeader";

const { TextArea } = Input;

const ExamCreatePage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const goBack = () => navigate("/exams");
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
  } = useExamCreateForm({
    form,
    isModalOpen: true,
    onCancel: goBack,
    onSuccess: goBack,
  });

  return (
    <AdminFormPageLayout
      onBack={handleCancel}
      title={<><FileAddOutlined /> Tạo đề thi mới</>}
    >
      <Card variant="borderless">
        <Form form={form} layout="vertical" onFinish={submitExam} size="large">
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Khoa"
                name="categoryId"
                rules={[{ required: true, message: "Chọn khoa!" }]}
              >
                <AdminFilterSelect
                  fullWidth
                  allowClear={false}
                  placeholder="Chọn khoa"
                  onChange={handleCategoryChange}
                  showSearch
                  optionFilterProp="label"
                  options={categories.map((category) => ({
                    label: category.categoryName,
                    value: category.categoryId,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Môn học"
                name="subjectId"
                rules={[{ required: true, message: "Chọn môn!" }]}
              >
                <AdminFilterSelect
                  fullWidth
                  allowClear={false}
                  placeholder={subjects.length === 0 ? "Chọn khoa trước" : "Chọn môn"}
                  onChange={handleSubjectChange}
                  disabled={subjects.length === 0}
                  showSearch
                  optionFilterProp="label"
                  options={subjects.map((subject) => ({
                    label: subject.name,
                    value: subject.subjectId,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mã đề" name="examCode">
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
                <InputNumber className="admin-full-control" min={1} placeholder="Ví dụ: 60" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Mô tả" name="description">
                <TextArea rows={1} placeholder="Ghi chú thêm..." />
              </Form.Item>
            </Col>
          </Row>

          <ExamQuestionConfigHeader
            loading={loading}
            modeControl={
              <Radio.Group
                value={generationMode}
                onChange={(event) => setGenerationMode(event.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="total">Ngẫu nhiên tổng hợp</Radio.Button>
                <Radio.Button value="difficulty">Theo độ khó</Radio.Button>
                <Radio.Button value="chapter">Theo chương</Radio.Button>
                <Radio.Button value="manual">Chọn thủ công</Radio.Button>
              </Radio.Group>
            }
            onCancel={handleCancel}
            onSubmit={() => form.submit()}
            saveText="Tạo đề thi"
            total={calculateTotalSelected()}
          />

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
          />

        </Form>
      </Card>
    </AdminFormPageLayout>
  );
};

export default ExamCreatePage;
