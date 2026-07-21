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
  Statistic,
  Table,
  Typography,
} from "antd";
import { ControlOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { AdminSaveButton } from "../../components/common/buttons/AdminButtons";
import MainBackButton from "../../components/common/MainBackButton";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminSearchInput,
} from "../../components/common/filters/AdminFilterControls";
import { useExamUpdateForm } from "./hooks/useExamUpdateForm";

const { Text, Title } = Typography;
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
    <div style={{ padding: 24 }}>
      <MainBackButton onClick={handleCancel} />

      <Space style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <EditOutlined /> Sửa đề thi #{examId}
        </Title>
      </Space>

      <Card variant="borderless">
        {detailLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : (
          <>
            <Alert
              showIcon
              type="info"
              message="Thay đổi danh sách câu hỏi chỉ áp dụng cho lượt làm mới. Lượt đang làm và kết quả đã nộp giữ snapshot cũ."
              style={{ marginBottom: 16 }}
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
                    <InputNumber min={1} style={{ width: "100%" }} />
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

              <Row align="middle" justify="space-between" gutter={16} style={{ margin: "24px 0 16px" }}>
                <Col>
                  <Text strong style={{ fontSize: 16 }}>
                    <ControlOutlined /> Cấu hình câu hỏi
                  </Text>
                </Col>
                <Col flex="auto">
                  <Text type="secondary">Chọn thủ công</Text>
                </Col>
                <Col>
                  <Space align="center">
                    <div
                      style={{
                        minWidth: 96,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "0 12px",
                        borderRadius: 6,
                        background: "var(--admin-bg)",
                      }}
                    >
                      <Text>Tổng:</Text>
                      <Statistic value={selectedQuestionIds.length} valueStyle={{ fontSize: 18 }} />
                    </div>
                    <AdminSaveButton
                      loading={loading}
                      onClick={() => form.submit()}
                    >
                      Lưu
                    </AdminSaveButton>
                  </Space>
                </Col>
              </Row>

              <Space direction="vertical" size={12} style={{ width: "100%" }}>
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

                <Table
                  size="small"
                  rowKey="questionId"
                  loading={pickerLoading}
                  dataSource={questions}
                  pagination={{
                    current: questionPage,
                    pageSize: 30,
                    total: questionTotal,
                    showSizeChanger: false,
                    onChange: setQuestionPage,
                  }}
                  rowSelection={{
                    selectedRowKeys: selectedQuestionIds,
                    preserveSelectedRowKeys: true,
                    onChange: (keys) => setSelectedQuestionIds(keys),
                  }}
                  onRow={(record) => ({
                    onClick: () => {
                      setSelectedQuestionIds((currentIds) =>
                        currentIds.includes(record.questionId)
                          ? currentIds.filter((questionId) => questionId !== record.questionId)
                          : [...currentIds, record.questionId]
                      );
                    },
                    style: { cursor: "pointer" },
                  })}
                  columns={[
                    { title: "Câu hỏi", dataIndex: "content", ellipsis: true },
                    { title: "Chương", dataIndex: "chapterName", width: 170 },
                    { title: "Độ khó", dataIndex: "difficulty", width: 110 },
                    { title: "Loại", dataIndex: "questionType", width: 150 },
                  ]}
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
    </div>
  );
};

export default ExamUpdatePage;
