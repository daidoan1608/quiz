import React from "react";
import {
  Card,
  Col,
  Divider,
  Modal,
  Row,
  Space,
  Spin,
  Statistic,
  Typography,
  theme,
} from "antd";
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  ControlOutlined,
} from "@ant-design/icons";
import MarkdownLatex from "../../../components/common/MarkdownLatex";
import { useExamDetail } from "../hooks/useExamDetail";

const { Title, Text } = Typography;

export const ExamDetailModal = ({ open, onCancel, examId }) => {
  const { token } = theme.useToken();
  const { examDetail, questions, loading } = useExamDetail({ examId, open });

  const renderAnswerItem = (answer, question) => {
    const isCorrect = answer.isCorrect;
    const answerStyle = {
      padding: "12px 16px",
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      transition: "all 0.3s",
      border: `1px solid ${isCorrect ? token.colorSuccess : token.colorBorder}`,
      background: isCorrect ? token.colorSuccessBg : token.colorBgContainer,
      color: isCorrect ? token.colorSuccessText : token.colorText,
    };

    return (
      <div key={answer.optionId} style={answerStyle}>
        <span style={{ flexGrow: 1 }}>
          <strong style={{ marginRight: 8 }}>
            {String.fromCharCode(65 + question.answers.indexOf(answer))}.
          </strong>
          <MarkdownLatex content={answer.content} as="span" />
        </span>

        {isCorrect && (
          <CheckCircleFilled
            style={{ fontSize: 18, color: token.colorSuccess }}
          />
        )}
      </div>
    );
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={980}
      centered
      destroyOnHidden
      className="detail-modal"
    >
      <Spin spinning={loading}>
        {examDetail ? (
          <div className="detail-modal-scroll">
            <div className="detail-modal-hero">
              <Space direction="vertical" size={4}>
                <Title level={3} style={{ margin: 0 }}>
                  {examDetail.title}
                </Title>
                <Text type="secondary">{examDetail.subjectName}</Text>
                <Text type="secondary">Mã đề: {examDetail.examCode}</Text>
              </Space>
            </div>

            <Card variant="borderless" className="modern-card" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Thời gian làm bài"
                    value={examDetail.duration}
                    suffix="phút"
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tổng số câu hỏi"
                    value={questions.length}
                    prefix={<ControlOutlined />}
                  />
                </Col>
              </Row>
            </Card>

            <Divider orientation="left">
              <Title level={5} style={{ margin: 0 }}>
                Nội dung các Câu hỏi
              </Title>
            </Divider>

            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {questions.map((question, index) => (
                <Card
                  key={question.questionId}
                  title={<Text strong>Câu {index + 1}</Text>}
                  variant="borderless"
                  className="modern-card detail-question-card"
                >
                  <MarkdownLatex
                    content={question.content}
                    style={{ fontSize: 15, marginBottom: 15 }}
                  />

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {question.answers.map((answer) =>
                      renderAnswerItem(answer, question)
                    )}
                  </div>
                </Card>
              ))}
            </Space>
          </div>
        ) : (
          <Text type="secondary">Không có dữ liệu đề thi để hiển thị.</Text>
        )}
      </Spin>
    </Modal>
  );
};
