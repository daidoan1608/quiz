import React from "react";
import {
  Alert,
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import { EditOutlined, SaveOutlined } from "@ant-design/icons";
import {
  cancelModalButtonStyle,
  primaryModalButtonStyle,
} from "../../../utils/ui/antdModalButtonStyles";
import { useExamUpdateForm } from "../hooks/useExamUpdateForm";

const { Text, Title } = Typography;
const { TextArea } = Input;

export const ExamFormUpdateModal = ({ open, examId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
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
  } = useExamUpdateForm({ form, examId, open, onCancel, onSuccess });

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <EditOutlined style={{ marginRight: 8 }} /> Sua de thi
        </Title>
      }
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" style={cancelModalButtonStyle} onClick={handleCancel}>
          Huy bo
        </Button>,
        <Button
          key="submit"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={() => form.submit()}
          size="large"
          style={primaryModalButtonStyle}
        >
          Luu thay doi
        </Button>,
      ]}
      width={980}
      centered
      destroyOnClose
    >
      <Spin spinning={detailLoading} tip="Dang tai de thi...">
        <Alert
          showIcon
          type="info"
          message="Thay doi danh sach cau hoi chi ap dung cho luot lam moi. Luot dang lam va ket qua da nop giu snapshot cu."
          style={{ marginBottom: 16 }}
        />

        <Form form={form} layout="vertical" onFinish={submitExam} size="large">
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Mon hoc"
                name="subjectId"
                rules={[{ required: true, message: "Chon mon hoc!" }]}
              >
                <Select
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
                label="Thoi gian lam bai (phut)"
                name="duration"
                rules={[{ required: true, message: "Nhap thoi gian!" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ma de" name="examCode">
            <Input placeholder="VD: JAVA-CK-001" />
          </Form.Item>

          <Form.Item
            label="Ten de thi"
            name="title"
            rules={[{ required: true, message: "Nhap ten de thi!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Mo ta" name="description">
            <TextArea rows={2} />
          </Form.Item>

          <Divider orientation="left">Danh sach cau hoi trong de</Divider>

          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Row gutter={12}>
              <Col xs={24} md={9}>
                <Input.Search
                  allowClear
                  placeholder="Tim noi dung cau hoi"
                  value={filters.keyword}
                  onChange={(event) => {
                    setQuestionPage(1);
                    setFilters({ ...filters, keyword: event.target.value });
                  }}
                />
              </Col>
              <Col xs={24} md={5}>
                <Select
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Chuong"
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
              </Col>
              <Col xs={24} md={5}>
                <Select
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Do kho"
                  value={filters.difficulty}
                  onChange={(value) => {
                    setQuestionPage(1);
                    setFilters({ ...filters, difficulty: value || null });
                  }}
                  options={[
                    { label: "De", value: "EASY" },
                    { label: "Trung binh", value: "MEDIUM" },
                    { label: "Kho", value: "HARD" },
                  ]}
                />
              </Col>
              <Col xs={24} md={5}>
                <Select
                  style={{ width: "100%" }}
                  value={filters.usageFilter}
                  onChange={(value) => {
                    setQuestionPage(1);
                    setFilters({ ...filters, usageFilter: value });
                  }}
                  options={[
                    { label: "Tat ca", value: "all" },
                    { label: "Chua dung", value: "unused" },
                    { label: "Da dung", value: "used" },
                  ]}
                />
              </Col>
            </Row>

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
              columns={[
                { title: "Cau hoi", dataIndex: "content", ellipsis: true },
                { title: "Chuong", dataIndex: "chapterName", width: 170 },
                { title: "Do kho", dataIndex: "difficulty", width: 110 },
                { title: "Loai", dataIndex: "questionType", width: 150 },
              ]}
            />

            <Text type="secondary">
              Da chon {selectedQuestionIds.length} cau. Dang hien thi{" "}
              {questions.length}/{questionTotal} cau theo bo loc.
            </Text>
          </Space>
        </Form>
      </Spin>
    </Modal>
  );
};
