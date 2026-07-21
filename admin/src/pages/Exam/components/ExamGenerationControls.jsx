import React from "react";
import {
  Alert,
  Col,
  Input,
  InputNumber,
  Row,
  Space,
  Table,
  Typography,
} from "antd";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminSearchInput,
} from "../../../components/common/filters/AdminFilterControls";

const { Text } = Typography;

export const ExamGenerationControls = ({
  selectedSubject,
  generationMode,
  setGenerationMode,
  maxQuestions,
  inputTotal,
  setInputTotal,
  inputDiff,
  setInputDiff,
  inputChapters,
  setInputChapters,
  manualFilters,
  manualPickerLoading,
  manualQuestionIds,
  manualQuestionPage,
  manualQuestionTotal,
  manualQuestions,
  setManualFilters,
  setManualQuestionIds,
  setManualQuestionPage,
}) => {
  const toggleManualQuestion = (questionId) => {
    setManualQuestionIds(
      manualQuestionIds.includes(questionId)
        ? manualQuestionIds.filter((id) => id !== questionId)
        : [...manualQuestionIds, questionId]
    );
  };

  if (!selectedSubject) {
    return (
      <Alert
        message="Vui lòng chọn môn học để xem câu hỏi khả dụng."
        type="info"
        showIcon
      />
    );
  }

  return (
    <>
      <div>
        {generationMode === "total" && (
          <Row gutter={16} align="middle">
            <Col span={10}>
              <Text>Số câu hỏi ngẫu nhiên</Text>
            </Col>
            <Col span={14}>
              <Space.Compact style={{ width: "100%" }}>
                <InputNumber
                  style={{ flex: 1 }}
                  min={0}
                  max={maxQuestions.totalQuestion}
                  value={inputTotal}
                  onChange={setInputTotal}
                />
                <Input
                  readOnly
                  value={`/ ${maxQuestions.totalQuestion || 0} có sẵn`}
                  style={{ width: 110, textAlign: "center" }}
                />
              </Space.Compact>
            </Col>
          </Row>
        )}

        {generationMode === "difficulty" && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ marginBottom: 5 }}>Dễ (Max: {maxQuestions.totalEasy})</div>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={maxQuestions.totalEasy}
                  value={inputDiff.easy}
                  onChange={(value) => setInputDiff({ ...inputDiff, easy: value || 0 })}
                />
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 5 }}>Trung bình (Max: {maxQuestions.totalMedium})</div>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={maxQuestions.totalMedium}
                  value={inputDiff.medium}
                  onChange={(value) => setInputDiff({ ...inputDiff, medium: value || 0 })}
                />
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 5 }}>Khó (Max: {maxQuestions.totalHard})</div>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={maxQuestions.totalHard}
                  value={inputDiff.hard}
                  onChange={(value) => setInputDiff({ ...inputDiff, hard: value || 0 })}
                />
              </Col>
            </Row>
          </Space>
        )}

        {generationMode === "chapter" && (
          <div>
            {inputChapters.map((chapter, index) => (
              <Row
                key={chapter.chapterId}
                style={{ marginBottom: 12 }}
                gutter={16}
                align="middle"
              >
                <Col span={14}>
                  <Text>{chapter.chapterName}</Text>
                </Col>
                <Col span={10}>
                  <Space.Compact style={{ width: "100%" }}>
                    <InputNumber
                      style={{ flex: 1 }}
                      min={0}
                      max={chapter.maxTotal}
                      value={chapter.selected}
                      onChange={(value) => {
                        const nextChapters = [...inputChapters];
                        nextChapters[index].selected = value || 0;
                        setInputChapters(nextChapters);
                      }}
                    />
                    <Input
                      readOnly
                      value={`/ ${chapter.maxTotal}`}
                      style={{ width: 72, textAlign: "center" }}
                    />
                  </Space.Compact>
                </Col>
              </Row>
            ))}
            {inputChapters.length === 0 && (
              <Text type="secondary">Môn này chưa có chương nào.</Text>
            )}
          </div>
        )}

        {generationMode === "manual" && (
          <Space direction="vertical" style={{ width: "100%" }} size={12}>
            <AdminFilterBar
              filters={
                <>
                <AdminSearchInput
                  placeholder="Tìm nội dung câu hỏi"
                  value={manualFilters.keyword}
                  onChange={(event) => {
                    setManualQuestionPage(1);
                    setManualFilters({ ...manualFilters, keyword: event.target.value });
                  }}
                />
                <AdminFilterSelect
                  placeholder="Chương"
                  value={manualFilters.chapterId}
                  onChange={(value) => {
                    setManualQuestionPage(1);
                    setManualFilters({ ...manualFilters, chapterId: value || null });
                  }}
                  options={inputChapters.map((chapter) => ({
                    label: chapter.chapterName,
                    value: Number(chapter.chapterId),
                  }))}
                />
                <AdminFilterSelect
                  placeholder="Độ khó"
                  value={manualFilters.difficulty}
                  onChange={(value) => {
                    setManualQuestionPage(1);
                    setManualFilters({ ...manualFilters, difficulty: value || null });
                  }}
                  options={[
                    { label: "Dễ", value: "EASY" },
                    { label: "Trung bình", value: "MEDIUM" },
                    { label: "Khó", value: "HARD" },
                  ]}
                />
                <AdminFilterSelect
                  allowClear={false}
                  value={manualFilters.usageFilter}
                  onChange={(value) => {
                    setManualQuestionPage(1);
                    setManualFilters({ ...manualFilters, usageFilter: value });
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
              loading={manualPickerLoading}
              dataSource={manualQuestions}
              onRow={(record) => ({
                onClick: () => toggleManualQuestion(record.questionId),
                style: { cursor: "pointer" },
              })}
              pagination={{
                current: manualQuestionPage,
                pageSize: 20,
                total: manualQuestionTotal,
                showSizeChanger: false,
                onChange: setManualQuestionPage,
              }}
              rowSelection={{
                selectedRowKeys: manualQuestionIds,
                preserveSelectedRowKeys: true,
                onChange: (keys) => setManualQuestionIds(keys),
                onCell: () => ({
                  onClick: (event) => event.stopPropagation(),
                }),
              }}
              columns={[
                { title: "Câu hỏi", dataIndex: "content", ellipsis: true },
                { title: "Chương", dataIndex: "chapterName", width: 160 },
                { title: "Độ khó", dataIndex: "difficulty", width: 110 },
                { title: "Loại", dataIndex: "questionType", width: 150 },
              ]}
            />
            <Text type="secondary">
              Đang hiển thị {manualQuestions.length}/{manualQuestionTotal} câu trong môn đã chọn.
            </Text>
          </Space>
        )}

      </div>
    </>
  );
};
