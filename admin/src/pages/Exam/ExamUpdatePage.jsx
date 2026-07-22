import React from "react";
import {
  Alert,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Skeleton,
  Space,
  Typography,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import AdminFormPageLayout from "../../components/common/layout/AdminFormPageLayout";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminSearchInput,
} from "../../components/common/filters/AdminFilterControls";
import { ExamQuestionConfigHeader } from "./components/ExamQuestionConfigHeader";
import { ExamQuestionPickerTable } from "./components/ExamQuestionPickerTable";
import { useExamUpdateForm } from "./hooks/useExamUpdateForm";

const { Text } = Typography;
const { TextArea } = Input;

const ExamUpdatePage = () => {
  const [form] = Form.useForm();
  const { examId } = useParams();
  const navigate = useNavigate();
  const goBack = () => navigate("/exams");
  const {
    chapters,
    detailLoading,
    filters,
    handleCancel,
    handleSubjectChange,
    loading,
    pickerLoading,
    questionPage,
    questionTotal,
    questions,
    selectedQuestionIds,
    setFilters,
    setQuestionPage,
    setSelectedQuestionIds,
    subjects,
    submitExam,
  } = useExamUpdateForm({
    form,
    examId,
    open: true,
    onCancel: goBack,
    onSuccess: goBack,
  });

  return (
    <AdminFormPageLayout
      onBack={handleCancel}
      title={<><EditOutlined /> Sửa đề thi #{examId}</>}
    >
      <Card variant="borderless">
        {detailLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : (
          <>
            <Alert
              className="exam-update-info-alert"
              showIcon
              type="info"
              message="Thay đổi danh sách câu hỏi chỉ áp dụng cho lượt làm mới. Lượt đang làm và kết quả đã nộp giữ snapshot cũ."
            />

            <Form form={form} layout="vertical" onFinish={submitExam} size="large">
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Môn học"
                    name="subjectId"
                    rules={[{ required: true, message: "Chọn môn học!" }]}
                  >
                    <AdminFilterSelect
                      fullWidth
                      allowClear={false}
                      showSearch
                      optionFilterProp="label"
                      onChange={handleSubjectChange}
                      options={subjects.map((subject) => ({
                        label: subject.name,
                        value: subject.subjectId,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Thời gian làm bài (phút)"
                    name="duration"
                    rules={[{ required: true, message: "Nhập thời gian!" }]}
                  >
                    <InputNumber className="admin-full-control" min={1} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Mã đề" name="examCode">
                <Input placeholder="VD: JAVA-CK-001" />
              </Form.Item>

              <Form.Item
                label="Tên đề thi"
                name="title"
                rules={[{ required: true, message: "Nhập tên đề thi!" }]}
              >
                <Input />
              </Form.Item>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item label="Mô tả" name="description">
                    <TextArea rows={1} placeholder="Ghi chú thêm..." />
                  </Form.Item>
                </Col>
              </Row>

              <ExamQuestionConfigHeader
                loading={loading}
                modeControl={<Text type="secondary">Chọn thủ công</Text>}
                onCancel={handleCancel}
                onSubmit={() => form.submit()}
                total={selectedQuestionIds.length}
              />

              <Space className="exam-update-question-stack" direction="vertical" size={12}>
                <AdminFilterBar
                  filters={
                    <>
                    <AdminSearchInput
                      placeholder="Tìm nội dung câu hỏi"
                      value={filters.keyword}
                      onChange={(event) => {
                        setQuestionPage(1);
                        setFilters({ ...filters, keyword: event.target.value });
                      }}
                    />
                    <AdminFilterSelect
                      placeholder="Chương"
                      value={filters.chapterId}
                      onChange={(value) => {
                        setQuestionPage(1);
                        setFilters({ ...filters, chapterId: value || null });
                      }}
                      options={chapters.map((chapter) => ({
                        label: chapter.name || chapter.chapterName,
                        value: Number(chapter.chapterId),
                      }))}
                    />
                    <AdminFilterSelect
                      placeholder="Độ khó"
                      value={filters.difficulty}
                      onChange={(value) => {
                        setQuestionPage(1);
                        setFilters({ ...filters, difficulty: value || null });
                      }}
                      options={[
                        { label: "Dễ", value: "EASY" },
                        { label: "Trung bình", value: "MEDIUM" },
                        { label: "Khó", value: "HARD" },
                      ]}
                    />
                    <AdminFilterSelect
                      allowClear={false}
                      value={filters.usageFilter}
                      onChange={(value) => {
                        setQuestionPage(1);
                        setFilters({ ...filters, usageFilter: value });
                      }}
                      options={[
                        { label: "Tất cả", value: "all" },
                        { label: "Chưa dùng", value: "unused" },
                        { label: "Đã dùng", value: "used" },
                      ]}
                    />
                    </>
                  }
                />

                <ExamQuestionPickerTable
                  loading={pickerLoading}
                  dataSource={questions}
                  onPageChange={setQuestionPage}
                  onSelectionChange={setSelectedQuestionIds}
                  page={questionPage}
                  pageSize={30}
                  selectedQuestionIds={selectedQuestionIds}
                  total={questionTotal}
                />

                <Text type="secondary">
                  Đã chọn {selectedQuestionIds.length} câu. Đang hiển thị{" "}
                  {questions.length}/{questionTotal} câu theo bộ lọc.
                </Text>
              </Space>

            </Form>
          </>
        )}
      </Card>
    </AdminFormPageLayout>
  );
};

export default ExamUpdatePage;
