import React from "react";
import {
  Alert,
  Col,
  Divider,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Typography,
} from "antd";

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
  calculateTotalSelected,
}) => {
  if (!selectedSubject) {
    return (
      <Alert
        message="Vui long chon Mon hoc de xem cau hoi kha dung."
        type="info"
        showIcon
      />
    );
  }

  return (
    <>
      <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Text strong>Phuong thuc tao de</Text>
        </Col>
        <Col>
          <Radio.Group
            value={generationMode}
            onChange={(event) => setGenerationMode(event.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="total">Ngau nhien tong hop</Radio.Button>
            <Radio.Button value="difficulty">Theo do kho</Radio.Button>
            <Radio.Button value="chapter">Theo chuong</Radio.Button>
            <Radio.Button value="manual">Chon thu cong</Radio.Button>
          </Radio.Group>
        </Col>
      </Row>

      <div>
        {generationMode === "total" && (
          <Row gutter={16} align="middle">
            <Col span={10}>
              <Text>So cau hoi ngau nhien</Text>
            </Col>
            <Col span={14}>
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={maxQuestions.totalQuestion}
                value={inputTotal}
                onChange={setInputTotal}
                addonAfter={`/ ${maxQuestions.totalQuestion || 0} co san`}
              />
            </Col>
          </Row>
        )}

        {generationMode === "difficulty" && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ marginBottom: 5 }}>De (Max: {maxQuestions.totalEasy})</div>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={maxQuestions.totalEasy}
                  value={inputDiff.easy}
                  onChange={(value) => setInputDiff({ ...inputDiff, easy: value || 0 })}
                />
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 5 }}>Trung binh (Max: {maxQuestions.totalMedium})</div>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={maxQuestions.totalMedium}
                  value={inputDiff.medium}
                  onChange={(value) => setInputDiff({ ...inputDiff, medium: value || 0 })}
                />
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 5 }}>Kho (Max: {maxQuestions.totalHard})</div>
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
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
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
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={chapter.maxTotal}
                    value={chapter.selected}
                    onChange={(value) => {
                      const nextChapters = [...inputChapters];
                      nextChapters[index].selected = value || 0;
                      setInputChapters(nextChapters);
                    }}
                    addonAfter={`/ ${chapter.maxTotal}`}
                  />
                </Col>
              </Row>
            ))}
            {inputChapters.length === 0 && (
              <Text type="secondary">Mon nay chua co chuong nao.</Text>
            )}
          </div>
        )}

        {generationMode === "manual" && (
          <Space direction="vertical" style={{ width: "100%" }} size={12}>
            <Row gutter={12}>
              <Col xs={24} md={9}>
                <Input.Search
                  allowClear
                  placeholder="Tim noi dung cau hoi"
                  value={manualFilters.keyword}
                  onChange={(event) => {
                    setManualQuestionPage(1);
                    setManualFilters({ ...manualFilters, keyword: event.target.value });
                  }}
                />
              </Col>
              <Col xs={24} md={5}>
                <Select
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Chuong"
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
              </Col>
              <Col xs={24} md={5}>
                <Select
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Do kho"
                  value={manualFilters.difficulty}
                  onChange={(value) => {
                    setManualQuestionPage(1);
                    setManualFilters({ ...manualFilters, difficulty: value || null });
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
                  value={manualFilters.usageFilter}
                  onChange={(value) => {
                    setManualQuestionPage(1);
                    setManualFilters({ ...manualFilters, usageFilter: value });
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
              loading={manualPickerLoading}
              dataSource={manualQuestions}
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
              }}
              columns={[
                { title: "Cau hoi", dataIndex: "content", ellipsis: true },
                { title: "Chuong", dataIndex: "chapterName", width: 160 },
                { title: "Do kho", dataIndex: "difficulty", width: 110 },
                { title: "Loai", dataIndex: "questionType", width: 150 },
              ]}
            />
            <Text type="secondary">
              Dang hien thi {manualQuestions.length}/{manualQuestionTotal} cau trong mon da chon.
            </Text>
          </Space>
        )}

        <Divider style={{ margin: "16px 0" }} />

        <Row justify="end" align="middle">
          <Text style={{ marginRight: 16 }}>Tong so cau hoi se tao:</Text>
          <Statistic value={calculateTotalSelected()} />
        </Row>
      </div>
    </>
  );
};
