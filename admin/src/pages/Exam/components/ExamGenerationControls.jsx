import React from "react";
import { Alert, Col, Divider, InputNumber, Radio, Row, Space, Statistic, Typography } from "antd";

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
  calculateTotalSelected,
}) => {
  if (!selectedSubject) {
    return (
      <Alert
        message="Vui lòng chọn Môn học để xem số lượng câu hỏi khả dụng."
        type="info"
        showIcon
      />
    );
  }

  return (
    <>
      <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Text strong>Phương thức tạo đề</Text>
        </Col>
        <Col>
          <Radio.Group
            value={generationMode}
            onChange={(event) => setGenerationMode(event.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="total">Ngẫu nhiên tổng hợp</Radio.Button>
            <Radio.Button value="difficulty">Theo độ khó</Radio.Button>
            <Radio.Button value="chapter">Theo chương</Radio.Button>
          </Radio.Group>
        </Col>
      </Row>

      <div>
        {generationMode === "total" && (
          <Row gutter={16} align="middle">
            <Col span={10}>
              <Text>Số câu hỏi ngẫu nhiên</Text>
            </Col>
            <Col span={14}>
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={maxQuestions.totalQuestion}
                value={inputTotal}
                onChange={setInputTotal}
                addonAfter={`/ ${maxQuestions.totalQuestion || 0} có sẵn`}
              />
            </Col>
          </Row>
        )}

        {generationMode === "difficulty" && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ marginBottom: 5 }}>
                  Dễ (Max: {maxQuestions.totalEasy})
                </div>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={maxQuestions.totalEasy}
                  value={inputDiff.easy}
                  onChange={(value) => setInputDiff({ ...inputDiff, easy: value })}
                />
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 5 }}>
                  Trung bình (Max: {maxQuestions.totalMedium})
                </div>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={maxQuestions.totalMedium}
                  value={inputDiff.medium}
                  onChange={(value) =>
                    setInputDiff({ ...inputDiff, medium: value })
                  }
                />
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 5 }}>
                  Khó (Max: {maxQuestions.totalHard})
                </div>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={maxQuestions.totalHard}
                  value={inputDiff.hard}
                  onChange={(value) => setInputDiff({ ...inputDiff, hard: value })}
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
                      nextChapters[index].selected = value;
                      setInputChapters(nextChapters);
                    }}
                    addonAfter={`/ ${chapter.maxTotal}`}
                  />
                </Col>
              </Row>
            ))}
            {inputChapters.length === 0 && (
              <Text type="secondary">Môn này chưa có chương nào.</Text>
            )}
          </div>
        )}

        <Divider style={{ margin: "16px 0" }} />

        <Row justify="end" align="middle">
          <Text style={{ marginRight: 16 }}>Tổng số câu hỏi sẽ tạo:</Text>
          <Statistic value={calculateTotalSelected()} />
        </Row>
      </div>
    </>
  );
};
